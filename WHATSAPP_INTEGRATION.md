# WhatsApp Integration Documentation

This document explains how WhatsApp Business Cloud API (Meta) is integrated into MunshiJee for sending invoice notifications.

## Architecture Overview

```
Invoice Creation (status=SENT)
         ↓
sendInvoiceNotification()
         ↓
Check Active Subscription & Quota
         ↓
WhatsAppService.send() → Meta Graph API
         ↓
NotificationLog (type=WHATSAPP)
         ↓
UserSubscription.whatsappUsed++
```

## Components

### 1. WhatsApp Service (`src/lib/whatsapp-service.ts`)

Core service that handles communication with Meta's WhatsApp Business Cloud API.

**Key Classes:**

- `WhatsAppService`: Main service class
  - `send(payload)`: Sends template-based WhatsApp messages
  - `sendText(to, message)`: Sends plain text (session-based, for debugging only)

**Configuration:**

```typescript
interface MetaConfig {
  accessToken: string;        // Permanent system user token
  phoneNumberId: string;      // WhatsApp Business Phone Number ID
  wabaId?: string;            // WABA ID (optional)
  apiVersion?: string;        // Default: v20.0
  templateName: string;       // Approved template name
  templateLanguage?: string;  // Default: en_US
}
```

**API Endpoint:**

```
POST https://graph.facebook.com/{apiVersion}/{phoneNumberId}/messages
```

**Request Format:**

```json
{
  "messaging_product": "whatsapp",
  "to": "923001234567",
  "type": "template",
  "template": {
    "name": "invoice_notification",
    "language": { "code": "en_US" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Customer Name" },
          { "type": "text", "text": "INV-0001" },
          { "type": "text", "text": "Rs.1000.00" },
          { "type": "text", "text": "Dec 31, 2026" }
        ]
      },
      {
        "type": "button",
        "sub_type": "url",
        "index": "0",
        "parameters": [
          { "type": "text", "text": "https://example.com/invoice.pdf" }
        ]
      }
    ]
  }
}
```

### 2. Notification Service (`src/lib/notification-service.ts`)

Orchestrates sending notifications via multiple channels (Email, SMS, WhatsApp).

**Key Function:**

```typescript
async function sendInvoiceNotification(invoiceId: string): Promise<void>
```

**Flow:**

1. Fetch invoice with customer and user details
2. Check for active subscription
3. Generate PDF token and download URL
4. Send Email (if enabled and quota available)
5. Send SMS (if enabled and quota available)
6. Send WhatsApp (if enabled and quota available)
7. Auto-disable channels when quota exhausted

**WhatsApp-specific logic:**

```typescript
if (
  invoice.user.whatsappNotificationsEnabled &&
  whatsappSettings &&
  invoice.customer.phone &&
  activeSubscription.whatsappUsed < activeSubscription.plan.whatsappLimit
) {
  await sendWhatsAppNotification(...);
} else if (whatsappUsed >= whatsappLimit) {
  // Auto-disable WhatsApp notifications
  await prisma.user.update({
    where: { id: invoice.userId },
    data: { whatsappNotificationsEnabled: false },
  });
}
```

### 3. Notification Logging

Every WhatsApp attempt is logged to the `NotificationLog` table:

**Schema:**

```prisma
model NotificationLog {
  id           String             @id @default(cuid())
  invoiceId    String
  invoice      Invoice            @relation(...)
  type         NotificationType   // EMAIL, SMS, WHATSAPP
  provider     String             // "meta"
  recipient    String             // Phone number
  status       NotificationStatus // PENDING, SENT, FAILED
  errorMessage String?
  sentAt       DateTime?
  createdAt    DateTime           @default(now())
}
```

**Logging Flow:**

1. Create log entry with status `PENDING`
2. Attempt to send message
3. Update log with `SENT` or `FAILED` status
4. Store error message if failed

### 4. Settings Management

#### Super Admin Settings UI

**Location:** `/settings` (WhatsApp tab)

**Component:** `src/components/settings/whatsapp-settings-form.tsx`

**Stored in Database:**

```sql
-- Two settings records per provider
INSERT INTO "Settings" (key, value, userId)
VALUES 
  ('whatsapp_provider', '"meta"', NULL),
  ('whatsapp_config', '{"accessToken": "...", "phoneNumberId": "...", ...}', NULL);
```

#### User Settings

**Location:** `/settings` (Notification Preferences)

**User Toggle:**

```typescript
User {
  whatsappNotificationsEnabled: boolean
}
```

Users can enable/disable WhatsApp notifications if:
- Super Admin has configured WhatsApp settings
- User has an active subscription with WhatsApp quota

### 5. Invoice Creation Trigger

**Location:** `src/app/api/invoices/route.ts`

```typescript
const invoice = await prisma.invoice.create({ ... });

if (invoice.status === "SENT") {
  sendInvoiceNotification(invoice.id).catch((error) => {
    console.error("Failed to send invoice notification:", error);
  });
}
```

**Important:** Notifications are ONLY sent for invoices with status `SENT`, not `DRAFT`.

### 6. Subscription Quota Management

**Database Schema:**

```prisma
model UserSubscription {
  whatsappUsed  Int @default(0)
  plan {
    whatsappLimit Int
  }
}
```

**Quota Check:**

```typescript
if (subscription.whatsappUsed < subscription.plan.whatsappLimit) {
  // Send message
  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: { whatsappUsed: { increment: 1 } },
  });
}
```

**Auto-disable when quota exhausted:**

```typescript
if (whatsappUsed >= whatsappLimit) {
  await prisma.user.update({
    where: { id: userId },
    data: { whatsappNotificationsEnabled: false },
  });
}
```

## Message Template Structure

WhatsApp requires pre-approved templates. MunshiJee uses this structure:

**Template Name:** `invoice_notification` (configurable)

**Template Body:**
```
Hi {{1}}, your invoice {{2}} for {{3}} is ready. Due date: {{4}}.
```

**Parameters:**
1. Customer Name
2. Invoice Number
3. Amount (formatted as Rs.X.XX)
4. Due Date (formatted)

**Optional Button:**
- Type: URL
- Text: "Download PDF"
- Dynamic URL: Invoice PDF download link

## Error Handling

### Service-Level Errors

```typescript
try {
  await whatsappService.send(payload);
} catch (error) {
  // Log error with details
  await updateNotificationLog(logId, 'FAILED', error.message);
  // Don't throw - avoid breaking invoice creation
  console.error('Failed to send WhatsApp notification:', error);
}
```

### Common Error Scenarios

1. **Invalid Access Token**
   - Status: 401
   - Fix: Generate new token with correct permissions

2. **Invalid Phone Number ID**
   - Status: 400
   - Fix: Verify Phone Number ID in Meta dashboard

3. **Template Not Found**
   - Status: 400
   - Fix: Ensure template is approved and name matches

4. **Recipient Not Allowed**
   - Status: 400
   - Fix: Add test phone number or use production number

5. **Message Quality Rating Low**
   - Status: 403
   - Fix: Improve template quality, review business verification

### Graph API Error Format

```json
{
  "error": {
    "message": "Invalid OAuth access token",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 463,
    "fbtrace_id": "..."
  }
}
```

## Testing

### Test Endpoint

**Location:** `src/app/api/settings/test-notification/route.ts`

**Usage:**

```bash
POST /api/settings/test-notification
Content-Type: application/json

{
  "type": "whatsapp",
  "config": {
    "provider": "meta",
    "config": { ... }
  },
  "phoneNumber": "923001234567"
}
```

**Test Payload:**

```typescript
{
  customerName: session.user.name || 'Test Customer',
  invoiceNumber: 'TEST-0001',
  amount: 'Rs.1000.00',
  dueDate: '30 days from now',
  pdfDownloadUrl: 'https://example.com/invoice.pdf'
}
```

### Monitoring

**Admin Dashboard:** `/admin/notifications`

View all notification logs with:
- Notification type (Email, SMS, WhatsApp)
- Status (Pending, Sent, Failed)
- Recipient
- Timestamp
- Error messages (if failed)

## Quota Management

See [WHATSAPP_QUOTAS.md](WHATSAPP_QUOTAS.md) for detailed information about:
- Meta's conversation-based pricing
- Messaging tier limits
- Quality rating requirements
- Best practices

## Security Considerations

1. **Access Token Storage**
   - Stored in database `Settings` table
   - Only accessible to Super Admin
   - Never exposed in API responses to regular users

2. **Phone Number Validation**
   - Formatted to remove special characters
   - Pakistan-aware (auto-adds country code 92)
   - Strips leading + for Meta API compatibility

3. **Error Messages**
   - Sanitized before showing to users
   - Full errors logged server-side only
   - No sensitive data in error responses

## Performance Considerations

1. **Async Notification Sending**
   - Notifications sent asynchronously (fire-and-forget)
   - Doesn't block invoice creation
   - Errors logged but don't fail the request

2. **Database Logging**
   - All notifications logged for audit trail
   - Indexed by invoiceId, status, createdAt
   - Enables analytics and debugging

3. **Rate Limiting**
   - Meta has API rate limits (80 messages/second per phone number)
   - Bulk invoices sent sequentially (not in parallel)
   - Consider implementing queue for high-volume use cases

## Future Enhancements

Potential improvements:

1. **Template Management UI**
   - Allow Super Admin to manage multiple templates
   - Switch templates per invoice type

2. **Message Scheduling**
   - Queue messages for optimal delivery times
   - Retry failed messages with exponential backoff

3. **Rich Media Support**
   - Send PDF attachments directly
   - Include images/logos in messages

4. **Conversation Tracking**
   - Track 24-hour conversation windows
   - Optimize for conversation-based pricing

5. **Analytics Dashboard**
   - Delivery rates by channel
   - Customer engagement metrics
   - Cost analysis per notification

## Troubleshooting

### Notifications Not Sending

1. Check Super Admin WhatsApp settings configured
2. Verify user has WhatsApp notifications enabled
3. Confirm active subscription with available quota
4. Review notification logs for error messages
5. Verify invoice status is `SENT` (not `DRAFT`)

### Template Issues

1. Ensure template is approved in Meta dashboard
2. Verify template name matches exactly (case-sensitive)
3. Check template language code is correct
4. Confirm template has required 4 body parameters

### Quota Exhausted

1. User's WhatsApp notifications will be auto-disabled
2. Check subscription status: `/api/subscription/current`
3. Upgrade subscription or wait for renewal
4. Admin can manually reset quotas in database if needed

## Related Files

- `src/lib/whatsapp-service.ts` - Core service
- `src/lib/notification-service.ts` - Orchestration
- `src/components/settings/whatsapp-settings-form.tsx` - Admin UI
- `src/app/api/settings/test-notification/route.ts` - Test endpoint
- `src/app/api/invoices/route.ts` - Invoice creation trigger
- `src/prisma/schema.prisma` - Database schema
- `WHATSAPP_API_SETUP.md` - Setup guide
- `WHATSAPP_QUOTAS.md` - Quota information
