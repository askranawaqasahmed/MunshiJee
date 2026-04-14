# How to Create Invoice Template in Wati.io

## Why You Need a Template

WhatsApp Business API requires **pre-approved templates** to initiate conversations with customers. Without an active conversation session, you cannot send free-form messages.

## Step 1: Create Template in Wati Dashboard

1. **Login to Wati.io**: https://app.wati.io

2. **Go to Templates Section**:
   - Click on **"Broadcast"** in the left menu
   - Then click on **"Message Templates"**

3. **Click "Create Template"**

4. **Fill in Template Details**:

   **Template Name**: `invoice_notification`
   
   **Category**: Select **"UTILITY"** (for transactional messages)
   
   **Language**: Select **"English"**
   
   **Header** (Optional): Leave empty or add "Invoice Notification"
   
   **Body** (Required - This is the main message):
   ```
   You have received an invoice of Rs.{{1}} from {{2}}.
   
   Download PDF: {{3}}
   ```
   
   **Footer** (Optional): Add your business name or tagline
   ```
   Thank you for your business!
   ```
   
   **Buttons** (Optional): You can add a URL button
   - Button Type: "Visit Website"
   - Button Text: "View Invoice"
   - URL: {{3}} (dynamic URL parameter)

5. **Parameter Mapping**:
   - `{{1}}` = Invoice Amount (e.g., "1,000.00")
   - `{{2}}` = Business Name
   - `{{3}}` = PDF Download URL

6. **Submit for Approval**:
   - Click **"Submit"**
   - WhatsApp will review your template (usually takes 1-24 hours)
   - You'll get an email when approved

## Step 2: Wait for Approval

- Check your email for approval notification
- Or check template status in Wati dashboard
- Status will change from **"PENDING"** to **"APPROVED"**

## Step 3: Configure in MunshiJee

Once approved:

1. Go to **MunshiJee → Settings → WhatsApp**
2. Enter template name: `invoice_notification`
3. Save settings
4. Test it!

## Alternative Template Formats

### Option 1: Shorter Version
```
Invoice Alert! 💰

Amount: Rs.{{1}}
From: {{2}}

📄 Download: {{3}}
```

### Option 2: More Professional
```
Dear Customer,

You have received a new invoice:

Invoice Amount: Rs.{{1}}
Issued by: {{2}}

Click here to download your invoice:
{{3}}

If you have any questions, please contact us.
```

### Option 3: With Emojis
```
📧 New Invoice Received!

💵 Amount: Rs.{{1}}
🏢 From: {{2}}

📥 Download your invoice here:
{{3}}

Thank you! 🙏
```

## Important Notes

### ✅ Do's:
- Use clear, professional language
- Keep it concise (under 1024 characters)
- Include all necessary information
- Use proper variables {{1}}, {{2}}, {{3}}
- Choose "UTILITY" category for transactional messages

### ❌ Don'ts:
- Don't use promotional language
- Don't include offers or discounts (use MARKETING category for that)
- Don't violate WhatsApp's commerce policies
- Don't use profanity or offensive content
- Don't make false claims

## Template Categories

- **UTILITY**: For transactional updates (invoices, receipts, confirmations) ✅ Use this
- **MARKETING**: For promotional messages (offers, discounts)
- **AUTHENTICATION**: For OTP and verification codes

## Testing Your Template

After approval, test it:

1. Make sure template status is **"APPROVED"** in Wati
2. In MunshiJee Settings → WhatsApp, enter the template name
3. Send a test message - it will use the template automatically
4. Check that variables are replaced correctly

## Troubleshooting

### Template Rejected?
Common reasons:
- Not enough context/information
- Using promotional language in UTILITY category
- Variables not properly explained
- Template doesn't match category

**Solution**: Revise and resubmit with clearer wording

### Template Not Working?
- Make sure status is "APPROVED" (not PENDING)
- Check exact template name (case-sensitive)
- Verify you're using correct parameters
- Check Wati API logs for errors

## Cost

- **Session Messages** (replies within 24h): FREE
- **Template Messages** (initiating conversations): Varies by region
  - Pakistan: ~$0.03 - $0.05 per message
  - Check Wati pricing for exact costs

## Fallback Strategy

MunshiJee is configured to:
1. **Try session message first** (free) - works if customer messaged you recently
2. **Fallback to template** (paid) - if no active session

This gives you the best of both worlds!

## Need Help?

- Wati Support: https://help.wati.io
- WhatsApp Business Policy: https://business.whatsapp.com/policy
- Template Guidelines: https://developers.facebook.com/docs/whatsapp/message-templates
