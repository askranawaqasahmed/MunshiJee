# Meta WhatsApp Message Template Setup

This guide helps you create and submit WhatsApp message templates for approval in Meta's WhatsApp Business Platform.

## Why Templates Are Required

WhatsApp Business API requires pre-approved message templates for:
- Business-initiated conversations (when no active 24-hour session exists)
- Transactional notifications (like invoices)
- Appointment reminders
- Shipping updates
- Account updates

**Important:** You CANNOT send free-form text messages outside a 24-hour conversation window. Templates must be approved by Meta first.

## Template Categories

Choose the appropriate category:

- **UTILITY**: Transactional messages (invoices, receipts, confirmations) ✅ Recommended for MunshiJee
- **AUTHENTICATION**: One-time passwords, verification codes
- **MARKETING**: Promotional content (requires opt-in)

## Creating the Invoice Notification Template

### Step 1: Access Template Manager

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Select your WhatsApp Business Account
3. Navigate to **Message Templates** in the sidebar
4. Click **Create Template**

### Step 2: Template Basic Information

**Template Name:** `invoice_notification`
- Use lowercase
- Use underscores instead of spaces
- No special characters
- Keep it descriptive

**Category:** Utility

**Languages:** English (US) - `en_US`

### Step 3: Template Content

#### Header (Optional but Recommended)

**Type:** Text

**Content:** `New Invoice from {{1}}`

**Variables:**
- `{{1}}` = Business/Sender Name

#### Body (Required)

**Content:**
```
Hi {{1}}, your invoice {{2}} for {{3}} is ready. Due date: {{4}}.

Thank you for your business!
```

**Variables:**
1. `{{1}}` = Customer Name
2. `{{2}}` = Invoice Number (e.g., INV-0001)
3. `{{3}}` = Amount (e.g., Rs.1000.00)
4. `{{4}}` = Due Date (e.g., Dec 31, 2026)

**Character Limit:** 1024 characters

#### Footer (Optional)

**Content:** `MunshiJee - Invoice Management`

**Character Limit:** 60 characters

#### Buttons (Optional but Recommended)

**Button Type:** Call to Action → Visit Website

**Button Text:** `Download PDF` or `View Invoice`

**URL Type:** Dynamic

**URL:** `{{1}}`
- This allows you to pass a dynamic URL for each message
- MunshiJee will pass the PDF download URL here

**Example Dynamic URL:** 
```
https://yourdomain.com/api/invoices/pdf/{{1}}
```

### Step 4: Example Preview

When you fill in the template, Meta shows a preview:

```
┌─────────────────────────────────┐
│ New Invoice from MunshiJee      │  [Header]
├─────────────────────────────────┤
│ Hi John Doe, your invoice       │  [Body]
│ INV-0001 for Rs.1000.00 is      │
│ ready. Due date: Dec 31, 2026.  │
│                                  │
│ Thank you for your business!    │
├─────────────────────────────────┤
│ MunshiJee - Invoice Management  │  [Footer]
├─────────────────────────────────┤
│ [ Download PDF ]                 │  [Button]
└─────────────────────────────────┘
```

### Step 5: Sample Content

Meta requires example values for all variables:

- Customer Name: `John Doe`
- Invoice Number: `INV-0001`
- Amount: `Rs.1000.00`
- Due Date: `Dec 31, 2026`
- PDF URL: `https://example.com/invoice.pdf`

### Step 6: Submit for Review

1. Review all content carefully
2. Click **Submit**
3. Wait for approval (typically 1-24 hours)

## Template Approval Process

### Approval Timeline

- **Fast Track**: 30 minutes to 2 hours (common for utility templates)
- **Standard**: 2-24 hours
- **Complex Cases**: Up to 48 hours

### Approval Status

Check status in Message Templates section:
- **Pending**: Under review
- **Approved**: Ready to use ✅
- **Rejected**: Needs modification ❌

### Common Rejection Reasons

1. **Promotional Content in Utility Category**
   - ❌ "Special offer! 50% discount"
   - ✅ "Your invoice is ready"

2. **Spelling/Grammar Errors**
   - Check for typos
   - Use proper capitalization
   - Professional language only

3. **Misleading Information**
   - Don't promise features you don't offer
   - Be clear about what the message is for

4. **Variable Misuse**
   - Each variable should have clear purpose
   - Don't use variables for formatting tricks

5. **Policy Violations**
   - No profanity or inappropriate content
   - No deceptive practices
   - Follow WhatsApp Commerce Policy

## Template Best Practices

### Do's ✅

- ✅ Keep it concise and clear
- ✅ Use professional language
- ✅ Include relevant transaction details
- ✅ Provide context (what, when, why)
- ✅ Add a call-to-action button
- ✅ Include your business name
- ✅ Test with real examples before submission

### Don'ts ❌

- ❌ Don't use promotional language in utility templates
- ❌ Don't include pricing in header/footer
- ❌ Don't use excessive emojis
- ❌ Don't use ALL CAPS
- ❌ Don't include payment links (unless for payment templates)
- ❌ Don't add unnecessary variables

## Alternative Template Variations

### Minimal Version

**Body:**
```
Hi {{1}},

Invoice {{2}} for {{3}} is ready.
Due: {{4}}

Download: {{5}}
```

### Detailed Version

**Body:**
```
Hi {{1}},

Your invoice {{2}} has been generated.

Amount: {{3}}
Due Date: {{4}}
Status: Pending Payment

Please download and review your invoice. If you have any questions, feel free to contact us.

Thank you for your business!
```

### With Payment Reminder

**Body:**
```
Hi {{1}},

Invoice {{2}} for {{3}} is ready.
Due date: {{4}}

Please make payment before the due date to avoid late fees.

Need help? Contact us anytime.
```

## Template Management Tips

### Multiple Templates

Create different templates for different scenarios:

1. **invoice_notification** - New invoice created
2. **invoice_reminder** - Payment reminder before due date
3. **invoice_overdue** - Payment overdue notification
4. **invoice_paid** - Payment confirmation
5. **invoice_cancelled** - Invoice cancelled notification

### Language Versions

Create templates in multiple languages if you serve international customers:
- `invoice_notification` (English)
- `invoice_notification_ur` (Urdu)
- `invoice_notification_ar` (Arabic)

### Version Control

If you need to update a template:
1. Template names are permanent (can't rename)
2. Create a new template with updated name: `invoice_notification_v2`
3. Update MunshiJee settings to use new template name
4. Old template remains available for backward compatibility

## Configuring Template in MunshiJee

Once your template is approved:

1. Log in as Super Admin
2. Go to **Settings** → **WhatsApp** tab
3. Fill in:
   - **Template Name**: `invoice_notification` (exact name from Meta)
   - **Template Language**: `en_US` (language code from Meta)
4. Save settings
5. Send test message to verify

## Testing Your Template

### Before Production

1. Use Meta's test phone numbers (added in API Setup)
2. Send test via MunshiJee's "Send Test Message" button
3. Verify:
   - All variables are populated correctly
   - Formatting looks good
   - Button/link works
   - Message is delivered promptly

### Test Checklist

- ✅ Template approved in Meta dashboard
- ✅ Template name matches exactly in MunshiJee
- ✅ Language code is correct
- ✅ Test message received on WhatsApp
- ✅ All 4 parameters display correctly
- ✅ PDF download button works (if included)
- ✅ Message formatting is clean

## Troubleshooting

### Template Not Found Error

```
Error: Template not found
```

**Solutions:**
- Verify template is **Approved** (not Pending or Rejected)
- Check template name matches exactly (case-sensitive)
- Ensure you're using the correct WABA
- Wait a few minutes after approval

### Template Rejected

**Check rejection reason:**
1. Go to Message Templates
2. Click on rejected template
3. Read rejection message
4. Fix the issue
5. Submit again

**Common fixes:**
- Remove promotional language
- Fix spelling errors
- Simplify content
- Change category if needed

### Variables Not Replacing

```
Message shows: "Hi {{1}}, your invoice..."
```

**Solutions:**
- Ensure you're passing parameters in correct order
- Check parameter types (all should be "text")
- Verify component structure in API call
- Check MunshiJee logs for parameter values

## Template Guidelines Reference

Official WhatsApp guidelines:

- [Message Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [Template Components](https://developers.facebook.com/docs/whatsapp/message-templates/creation)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Commerce Policy](https://www.whatsapp.com/legal/commerce-policy)

## Support

If your template is repeatedly rejected:

1. Review Meta's template guidelines
2. Check examples from approved templates
3. Contact Meta Business Support
4. Simplify your template and try again
5. Review rejection feedback carefully

## Quick Reference

**Recommended Template for MunshiJee:**

```
Name: invoice_notification
Category: UTILITY
Language: en_US

Header: New Invoice from {{1}}

Body: Hi {{1}}, your invoice {{2}} for {{3}} is ready. Due date: {{4}}.

Thank you for your business!

Footer: MunshiJee - Invoice Management

Button: Download PDF (URL: {{1}})
```

**Parameters in MunshiJee Code:**
1. Customer Name
2. Invoice Number
3. Amount
4. Due Date
5. PDF URL (for button)

This template is optimized for quick approval and provides all essential invoice information to customers.
