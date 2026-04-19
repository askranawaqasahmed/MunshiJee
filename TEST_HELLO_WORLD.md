# Test WhatsApp Integration with hello_world Template

While your `invoice_generation` template is under review, test the complete integration using Meta's default `hello_world` template.

## Step 1: Configure MunshiJee

1. Start your server (if not running):
   ```bash
   npm run dev
   ```

2. Login as Super Admin
3. Go to **Settings** → **WhatsApp** tab
4. Fill in:
   ```
   Access Token: [Paste your permanent token here]
   Phone Number ID: [Paste your 15-digit ID here]
   WABA ID: [Optional]
   API Version: v20.0
   Template Name: hello_world
   Template Language: en_US
   ```

5. **Important:** Use `hello_world` as the template name for now

## Step 2: Test the Connection

1. In the WhatsApp settings form, scroll to **Test Phone Number**
2. Enter your WhatsApp number in international format:
   ```
   Example: 923001234567 (for Pakistan)
   No + sign, just numbers
   ```

3. Click **Send Test Message**

4. Check your WhatsApp - you should receive Meta's default hello_world message!

## What the hello_world Template Looks Like

The `hello_world` template is Meta's default test template. It's very simple:

```
Hello World
```

That's it! If you receive this message, your integration is working perfectly!

## Step 3: Verify Notification Logs

1. Go to **Admin** → **Notifications**
2. You should see a log entry showing:
   - Type: WHATSAPP
   - Provider: meta
   - Status: SENT (if successful)
   - Recipient: Your phone number

If status is FAILED, check the error message in the log.

## Step 4: Test Invoice Creation (When Template Approved)

Once `invoice_generation` is approved:

1. Go back to **Settings** → **WhatsApp** tab
2. Change **Template Name** from `hello_world` to `invoice_generation`
3. Click **Save Settings**
4. Create a test invoice:
   ```
   - Go to Invoices → Add Invoice
   - Fill in customer details with WhatsApp number
   - Set status to "SENT" (not DRAFT!)
   - Save
   ```
5. Customer should receive WhatsApp with invoice details + Pay Now button

## Troubleshooting

### "Template not found" Error
- Make sure you typed `hello_world` exactly (lowercase, underscore)
- Language should be `en_US`

### No Message Received
- Verify Access Token is correct (should start with EAA...)
- Check Phone Number ID is exactly 15 digits
- Ensure your test phone number is added in Meta dashboard:
  - Go to WhatsApp → API Setup
  - Add your number to test recipients
  - Send opt-in message to your number

### Test Phone Number Not Allowed
For testing/sandbox mode:
1. Go to Meta dashboard → WhatsApp → API Setup
2. Click "Add phone number" under test numbers
3. Add your WhatsApp number
4. You'll receive a message with a code
5. Reply with the code to opt-in

## What to Expect

### hello_world Test (Now)
```
Your Phone: +92 300 1234567

WhatsApp Message Received:
┌─────────────────┐
│ Hello World     │
└─────────────────┘
```

### invoice_generation Test (After Approval)
```
Your Phone: +92 300 1234567

WhatsApp Message Received:
┌─────────────────────────────────────┐
│ New Invoice from MunshiJee          │
├─────────────────────────────────────┤
│ Hi Rana Waqas,                      │
│                                     │
│ Your invoice INV-0001 for           │
│ Rs.1000.00 has been generated.      │
│                                     │
│ Due Date: Dec 31, 2026              │
│                                     │
│ Please review and make payment      │
│ before the due date.                │
│                                     │
│ Thank you for your business!        │
├─────────────────────────────────────┤
│ MunshiJee - Invoice Management      │
├─────────────────────────────────────┤
│         [   Pay Now   ]             │
└─────────────────────────────────────┘
```

## API Credentials Checklist

- [ ] Access Token obtained (permanent, never expires)
- [ ] Phone Number ID copied (15 digits)
- [ ] Test phone number added in Meta dashboard
- [ ] Test phone number opted-in (replied to code)
- [ ] Settings configured in MunshiJee
- [ ] hello_world test message sent successfully
- [ ] Waiting for invoice_generation template approval
- [ ] Will switch to invoice_generation once approved

## Next Steps Timeline

**Now (15 minutes):**
- ✅ Get API credentials
- ✅ Configure MunshiJee settings
- ✅ Test with hello_world template
- ✅ Verify logs show SENT status

**After Template Approval (1-24 hours):**
- ✅ Change template name to invoice_generation
- ✅ Create test invoice
- ✅ Verify invoice notification received
- ✅ Test Pay Now button
- ✅ Verify payment page loads correctly

**Production Ready:**
- ✅ All tests passed
- ✅ Logs showing successful deliveries
- ✅ Payment page accessible
- ✅ Ready to send real invoices!

---

## Quick Reference

### MunshiJee Settings (For Testing)
```json
{
  "accessToken": "EAAxxxxxxxxxxxxx...",
  "phoneNumberId": "123456789012345",
  "apiVersion": "v20.0",
  "templateName": "hello_world",
  "templateLanguage": "en_US"
}
```

### MunshiJee Settings (After Approval)
```json
{
  "accessToken": "EAAxxxxxxxxxxxxx...",
  "phoneNumberId": "123456789012345",
  "apiVersion": "v20.0",
  "templateName": "invoice_generation",
  "templateLanguage": "en_US"
}
```

---

**Start testing now!** Get your API credentials and test with `hello_world` while waiting for approval! 🚀
