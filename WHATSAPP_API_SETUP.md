# WhatsApp Business Cloud API Setup Guide (Meta)

This guide will help you set up Meta's WhatsApp Business Cloud API for sending invoice notifications to your customers.

## Prerequisites

- A Meta Business Account
- A Facebook Developer Account
- A verified business phone number
- A test phone number (can be your own WhatsApp number)

## Step 1: Create a Meta Business App

1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select **Business** as the app type
4. Fill in your app details:
   - App name: e.g., "MunshiJee Invoice Notifications"
   - Business account: Select your business account
5. Click **Create App**

## Step 2: Add WhatsApp Product

1. In your app dashboard, find **WhatsApp** in the Products section
2. Click **Set Up** next to WhatsApp
3. Complete the Quick Start wizard:
   - Select or create a WhatsApp Business Account (WABA)
   - Add a phone number or use the test number provided by Meta
   - Verify your business phone number

## Step 3: Get Your Phone Number ID

1. In the WhatsApp section of your app dashboard
2. Go to **API Setup** or **Getting Started**
3. Find your **Phone Number ID** (15-digit number)
4. Copy and save this - you'll need it for MunshiJee settings

Example Phone Number ID: `123456789012345`

## Step 4: Create a System User and Access Token

### Create System User

1. Go to [Meta Business Settings](https://business.facebook.com/settings/)
2. Navigate to **Users** → **System Users**
3. Click **Add** to create a new system user
4. Give it a name like "MunshiJee WhatsApp Service"
5. Assign **Admin** role

### Generate Access Token

1. Click on the system user you just created
2. Click **Generate New Token**
3. Select your WhatsApp app from the dropdown
4. Select permissions:
   - ✅ `whatsapp_business_messaging` (required)
   - ✅ `whatsapp_business_management` (recommended)
5. Set token expiration to **Never** (permanent token)
6. Click **Generate Token**
7. **IMPORTANT**: Copy and save this token immediately - you won't be able to see it again!

Example Access Token: `EAAxxxxxxxxxxxx...` (very long string)

## Step 5: Create and Approve Message Template

WhatsApp requires pre-approved message templates for business-initiated conversations.

### Template Structure

Your template must include these components:

**Template Name**: `invoice_notification` (or your preferred name)

**Category**: Utility

**Language**: English (US) or your preferred language

**Body Text**:
```
Hi {{1}}, your invoice {{2}} for {{3}} is ready. Due date: {{4}}.
```

**Parameters**:
1. `{{1}}` - Customer Name
2. `{{2}}` - Invoice Number
3. `{{3}}` - Amount (e.g., Rs.1000.00)
4. `{{4}}` - Due Date

**Optional: Add a Button**:
- Button Type: URL
- Button Text: "Download PDF"
- URL: Dynamic (use `{{1}}` as the dynamic URL parameter)

### Submit Template for Approval

1. In your WhatsApp Business Account dashboard
2. Go to **Message Templates**
3. Click **Create Template**
4. Fill in the template details as shown above
5. Submit for approval (usually takes a few hours, up to 24 hours)

### Example Template Body

```
Hi {{1}}, your invoice {{2}} for {{3}} is ready. Due date: {{4}}.

Thank you for your business!
```

## Step 6: Configure MunshiJee

1. Log in to MunshiJee as a Super Admin
2. Go to **Settings** → **WhatsApp** tab
3. Fill in the following details:

   - **Access Token**: Paste your permanent system user token
   - **Phone Number ID**: Your 15-digit phone number ID
   - **WABA ID** (Optional): Your WhatsApp Business Account ID
   - **API Version**: `v20.0` (or latest version)
   - **Template Name**: `invoice_notification` (or your approved template name)
   - **Template Language**: `en_US` (or your template language code)

4. Enter a test phone number (use international format without +)
   - Example: `923001234567` for Pakistan
5. Click **Send Test Message**
6. Check your WhatsApp for the test message
7. If successful, click **Save Settings**

## Step 7: Enable WhatsApp Notifications for Users

### For Super Admin:
All settings are configured globally in Settings → WhatsApp tab.

### For Regular Users:
1. Go to **Settings** page
2. Find **WhatsApp Notifications** toggle
3. Enable it (only works if Super Admin has configured WhatsApp settings)
4. Save preferences

## Troubleshooting

### Test Message Fails

**Error: Invalid Phone Number ID**
- Verify your Phone Number ID is correct (15 digits)
- Make sure you're using the Phone Number ID, not the phone number itself

**Error: Invalid Access Token**
- Generate a new system user token
- Make sure you selected the correct app when generating
- Ensure `whatsapp_business_messaging` permission is included

**Error: Template Not Found**
- Verify your template is approved (check status in Message Templates)
- Ensure the template name matches exactly (case-sensitive)
- Wait a few minutes after approval before testing

**Error: Recipient Phone Number Not Allowed**
- For test/sandbox phone numbers, you need to add test recipients
- Go to WhatsApp → API Setup → Add test phone number
- Send opt-in confirmation message to the test number

### Message Delivered But Not Received

- Check if the recipient's WhatsApp is active
- Verify the phone number format (should be just digits, e.g., 923001234567)
- Check WhatsApp Business account status (not suspended)
- Review message quality rating in Meta Business Manager

### Template Rejected

Common reasons:
- Template contains promotional content (not allowed in Utility category)
- Spelling or grammar errors
- Template doesn't follow WhatsApp guidelines
- Variable placeholders not properly formatted

Fix and resubmit for approval.

## Testing in Production

Once setup is complete and templates are approved:

1. Create a test invoice with status "SENT"
2. Make sure the customer has a valid WhatsApp phone number
3. Check the customer's WhatsApp for the notification
4. Verify the notification log in Admin → Notifications

## Rate Limits and Quotas

- **Messaging Tier**: New businesses start in Tier 1 (250 conversations/24hrs)
- **Quality Rating**: Maintain high quality to unlock higher tiers
- **Template Messages**: Count towards your messaging quota
- See [WHATSAPP_QUOTAS.md](WHATSAPP_QUOTAS.md) for detailed quota information

## Production Checklist

- ✅ Meta Business Account verified
- ✅ WhatsApp Business Account created
- ✅ Business phone number verified
- ✅ System user created with permanent token
- ✅ Message template approved
- ✅ Test message successfully sent
- ✅ Phone number quality rating is "High"
- ✅ Settings saved in MunshiJee

## Additional Resources

- [Meta WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Message Templates Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [WhatsApp Cloud API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Business Manager Help Center](https://www.facebook.com/business/help)

## Support

If you encounter issues not covered in this guide:

1. Check the MunshiJee logs in the terminal
2. Review the notification logs in Admin → Notifications
3. Check Meta Business Manager for any account restrictions
4. Review WhatsApp API error codes in the [Meta documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes)
