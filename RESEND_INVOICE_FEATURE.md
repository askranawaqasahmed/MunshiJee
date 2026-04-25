# Resend Invoice Feature

## Overview
Added the ability to resend invoice notifications (Email, SMS, WhatsApp) to customers with a confirmation dialog.

## What Was Added

### 1. API Endpoint
**Path:** `POST /api/invoices/[id]/resend`

**Features:**
- Resends all enabled notifications (Email, SMS, WhatsApp) for an invoice
- Respects user's notification settings and subscription limits
- Security checks:
  - User must be authenticated
  - Non-admin users can only resend their own invoices
  - Admins can resend any invoice

**Response:**
```json
{
  "success": true,
  "message": "Invoice notifications have been resent"
}
```

### 2. Invoice Detail Page - Resend Button
**Location:** `/invoices/[id]` page

**Features:**
- Added "Resend" button next to "Download PDF" button
- Shows confirmation dialog before resending
- Dialog displays:
  - Customer name
  - Invoice number
  - Clear confirmation message
- Loading state while resending
- Success/error alerts

**Button Location:**
```
[Download PDF] [Resend] [Mark as Paid] [Delete]
```

### 3. Confirmation Dialog
**Content:**
- Title: "Resend Invoice Notifications"
- Description: Shows customer name and invoice number
- Two buttons:
  - "Cancel" - Closes dialog without action
  - "Resend Invoice" - Triggers the resend

**Dialog Text:**
> This will resend invoice notifications (Email, SMS, WhatsApp) to the customer **[Customer Name]** for invoice **[Invoice Number]**.
> 
> Are you sure you want to continue?

## How It Works

### Flow:
1. User opens invoice detail page
2. User clicks "Resend" button
3. Confirmation dialog appears
4. User clicks "Resend Invoice" button
5. API endpoint is called
6. Notification service processes the invoice:
   - Checks user's notification settings
   - Checks subscription limits
   - Sends enabled notifications (Email/SMS/WhatsApp)
   - Creates log entries for each attempt
7. Success message shown to user
8. User can check `/logs` page to see delivery status

### What Gets Resent:
- **Email** - If email notifications enabled and quota available
- **SMS** - If SMS notifications enabled and quota available
- **WhatsApp** - If WhatsApp notifications enabled and quota available

### Behavior:
- Only sends notifications that are enabled in user settings
- Respects subscription quota limits
- Creates new log entries in the notification logs
- Does NOT send if quota is exceeded
- Does NOT send if notification type is disabled

## Use Cases

### 1. Customer Didn't Receive Original Notification
- Customer claims they didn't receive the invoice
- User can resend from invoice detail page
- Check logs to verify if original was sent

### 2. WhatsApp Failed Initially
- WhatsApp notification failed due to API error
- User fixed WhatsApp configuration
- User can resend to retry WhatsApp delivery

### 3. Customer Request
- Customer asks for invoice to be resent
- User can easily resend without generating new invoice

### 4. Testing Notifications
- User wants to test notification configuration
- Can resend invoice to verify settings work

## Security & Permissions

### Regular Users:
- Can resend their own invoices
- Cannot resend invoices created by other users

### Super Admins:
- Can resend any invoice in the system

### Rate Limiting:
- Respects subscription quota limits
- Won't send if quota exceeded
- Auto-disables notification type when quota reached

## Checking Resend Results

After resending, check the **Logs** page (`/logs`):

1. Go to `/logs` in your application
2. Filter by the invoice number
3. Look for new entries with recent timestamps
4. Check status:
   - **✓ Delivered** - Notification sent successfully
   - **✗ Failed** - See error details in red box
   - **⏳ Pending** - Still processing

## Example Usage

### Scenario: Resending Failed WhatsApp
1. User notices WhatsApp failed in logs
2. User fixes WhatsApp configuration in Settings
3. User goes to invoice detail page
4. User clicks "Resend" button
5. Confirms resend in dialog
6. System sends all enabled notifications again
7. User checks logs to verify WhatsApp was delivered

### Scenario: Customer Request
1. Customer calls: "Can you resend the invoice?"
2. User finds invoice in invoices list
3. User clicks "View" to open invoice detail
4. User clicks "Resend" button
5. Confirms resend
6. Customer receives notifications again

## Technical Details

### Files Modified:
- `src/app/api/invoices/[id]/resend/route.ts` - New API endpoint
- `src/app/invoices/[id]/page.tsx` - Added resend button and dialog
- Uses existing `sendInvoiceNotification()` function from `notification-service.ts`

### Dependencies:
- Uses Radix UI Dialog component
- Uses existing notification service
- Leverages existing logging system

### Error Handling:
- Shows user-friendly error messages
- Logs errors to console
- Provides context in error messages

## Notes

- Resending creates new log entries (doesn't update old ones)
- Each resend attempt consumes quota if notification is sent
- Disabled notifications won't be sent even if resend is clicked
- Dialog prevents accidental resends
- Works with all notification types (Email, SMS, WhatsApp)
