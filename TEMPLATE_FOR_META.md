# WhatsApp Template for Meta Approval - COPY THIS EXACTLY

## Template Configuration

Use these EXACT values when creating your template in Meta Business Manager:

---

### Basic Information

**Template Name:** `invoice_generation`

**Category:** `UTILITY`

**Language:** `English (US)` - Language Code: `en_US`

---

### Header

**Type:** Text

**Content:**
```
New Invoice from {{1}}
```

**Sample Value for {{1}}:** `MunshiJee`

---

### Body

**Content:**
```
Hi {{1}},

Your invoice {{2}} for {{3}} has been generated.

Due Date: {{4}}

Please review and make payment before the due date.

Thank you for your business!
```

**Sample Values:**
- {{1}}: `John Doe`
- {{2}}: `INV-0001`
- {{3}}: `Rs.1000.00`
- {{4}}: `Dec 31, 2026`

---

### Footer (Optional but Recommended)

**Content:**
```
MunshiJee - Invoice Management
```

---

### Button

**Type:** Call to Action

**Action Type:** Visit Website

**Button Text:** `Pay Now`

**Website URL Type:** Dynamic

**Website URL:**
```
https://munshiji.pk/payment/{{1}}
```

**Sample Value for {{1}}:** `clxxxxxxxxxxxxxx` (invoice ID)

**Important:** Replace `munshiji.pk` with your actual domain name. For testing, you can use `localhost:3000` but for production approval, use your live domain.

---

## Complete Template Preview

When filled with sample data, your template will look like this in WhatsApp:

```
┌─────────────────────────────────────────┐
│ New Invoice from MunshiJee              │  [HEADER]
├─────────────────────────────────────────┤
│ Hi John Doe,                            │  [BODY]
│                                         │
│ Your invoice INV-0001 for Rs.1000.00    │
│ has been generated.                     │
│                                         │
│ Due Date: Dec 31, 2026                  │
│                                         │
│ Please review and make payment before   │
│ the due date.                           │
│                                         │
│ Thank you for your business!            │
├─────────────────────────────────────────┤
│ MunshiJee - Invoice Management          │  [FOOTER]
├─────────────────────────────────────────┤
│           [   Pay Now   ]               │  [BUTTON]
└─────────────────────────────────────────┘
```

---

## Step-by-Step Creation in Meta

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Select your WhatsApp Business Account
3. Click **Message Templates** in the left sidebar
4. Click **Create Template** button
5. Fill in:
   - **Template name:** `invoice_generation`
   - **Category:** Select `UTILITY`
   - **Languages:** Select `English (US)`
6. Click **Continue**
7. **Header Section:**
   - Click **+ Add header**
   - Select **Text** type
   - Paste: `New Invoice from {{1}}`
   - In the sample value box, enter: `MunshiJee`
8. **Body Section:**
   - Paste the body text (see above)
   - Fill sample values for each {{variable}}
9. **Footer Section:**
   - Click **+ Add footer**
   - Paste: `MunshiJee - Invoice Management`
10. **Buttons Section:**
    - Click **+ Add button**
    - Select **Call to action**
    - Select **Visit website**
    - Button text: `Pay Now`
    - Select **Dynamic** URL type
    - Website URL: `https://munshiji.pk/payment/{{1}}`
    - Sample value: Enter a sample invoice ID
11. **Review** the preview on the right side
12. Click **Submit** for approval

---

## After Approval

Once your template is approved (usually within 1-24 hours):

1. Go to MunshiJee → Login as Super Admin
2. Navigate to **Settings** → **WhatsApp** tab
3. Fill in your Meta WhatsApp configuration:
   - **Access Token:** Your permanent system user token
   - **Phone Number ID:** Your WhatsApp Business Phone Number ID
   - **Template Name:** `invoice_generation`
   - **Template Language:** `en_US`
4. Enter a test phone number
5. Click **Send Test Message**
6. Check your WhatsApp to verify

---

## Important Notes

### For Domain URL

- **Development/Testing:** You can use `http://localhost:3000/payment/{{1}}` for initial testing, but Meta may reject it
- **Staging:** Use a public staging URL like `https://staging.munshiji.pk/payment/{{1}}`
- **Production:** Use your live domain `https://munshiji.pk/payment/{{1}}`

**Note:** Meta prefers HTTPS URLs for production templates.

### Template Approval Tips

✅ **Do:**
- Keep language professional and clear
- Use proper grammar and spelling
- Make the purpose of the message obvious
- Include all required information (amount, due date)
- Use a call-to-action button

❌ **Don't:**
- Use promotional language in UTILITY templates
- Include marketing messages
- Use all caps or excessive punctuation
- Add emojis (they may get rejected)
- Make false promises

### Common Rejection Reasons

1. **Wrong Category:** Marketing content in UTILITY category
2. **Spelling Errors:** Check all text carefully
3. **Missing Information:** Variables must be clear and necessary
4. **URL Issues:** Use HTTPS, not HTTP for production
5. **Button Problems:** Button text should match the action

---

## Testing the Payment Page

Your payment page is now available at:
```
http://localhost:3000/payment/[invoice-id]
```

### To Test:

1. Create a test invoice in MunshiJee
2. Copy the invoice ID from the URL or database
3. Visit: `http://localhost:3000/payment/[paste-invoice-id-here]`
4. You should see:
   - Invoice details
   - Customer information
   - Itemized list
   - Payment summary
   - **Pay Now** button (currently shows coming soon message)

### API Endpoint:

The payment page uses this public API endpoint:
```
GET /api/payment/invoice/[invoiceId]
```

This is accessible without authentication so customers can view their invoices via the WhatsApp link.

---

## MunshiJee Settings Configuration

After template approval, configure these in MunshiJee Settings:

```
Access Token: EAAxxxxxxxxxxxxxxxxx (from Meta System User)
Phone Number ID: 123456789012345 (15 digits)
WABA ID: 123456789012345 (optional)
API Version: v20.0
Template Name: invoice_generation
Template Language: en_US
```

---

## Template Parameters Summary

| Position | Component | Parameter | Value | Description |
|----------|-----------|-----------|-------|-------------|
| Header | Header | {{1}} | MunshiJee | Business Name |
| Body | Body | {{1}} | John Doe | Customer Name |
| Body | Body | {{2}} | INV-0001 | Invoice Number |
| Body | Body | {{3}} | Rs.1000.00 | Amount |
| Body | Body | {{4}} | Dec 31, 2026 | Due Date |
| Button | Button | {{1}} | clxxxxxx | Invoice ID (for URL) |

---

## Need Help?

If your template gets rejected:

1. Read the rejection reason carefully
2. Fix the specific issue mentioned
3. Resubmit with corrections
4. Contact Meta Business Support if unclear

For MunshiJee integration help:
- Check notification logs in Admin → Notifications
- Review server logs for API errors
- Test with the "Send Test Message" button first

---

**Ready to submit?** Copy the template details above and create it in Meta Business Manager! 🚀
