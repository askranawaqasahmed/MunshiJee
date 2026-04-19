# Quick Start: WhatsApp Integration & Payment Page

## ✅ What's Been Created

### 1. Payment Page
- **URL:** `/payment/[invoiceId]`
- **Features:**
  - Beautiful, responsive design with gradient background
  - Shows complete invoice details
  - Customer information display
  - Itemized list of invoice items
  - Payment history (if any)
  - **Pay Now** button (ready for future payment gateway integration)
  - Status badges (Paid/Unpaid/Overdue)
  - Mobile-friendly layout

### 2. Payment API Endpoint
- **Endpoint:** `GET /api/payment/invoice/[invoiceId]`
- **Access:** Public (no authentication required)
- **Returns:** Complete invoice data with customer, items, and payments

### 3. WhatsApp Template Integration
- Template name: `invoice_generation`
- Header with business name parameter
- Body with 4 parameters (customer name, invoice number, amount, due date)
- **Pay Now** button that links to the payment page
- Button URL format: `https://munshiji.pk/payment/[invoiceId]`

### 4. Updated Code
- ✅ WhatsApp service updated to support header and payment URL button
- ✅ Notification service passes invoice ID for payment link
- ✅ Test endpoint updated with new template structure
- ✅ Settings form updated with new template requirements

---

## 🚀 Next Steps

### Step 1: Create WhatsApp Template in Meta

Open the file: **`TEMPLATE_FOR_META.md`**

This file contains:
- ✅ Exact template text to copy-paste
- ✅ Step-by-step Meta Business Manager instructions
- ✅ Sample values for all parameters
- ✅ Complete template preview
- ✅ Approval tips and common issues

**Action:** Follow the instructions in `TEMPLATE_FOR_META.md` to create and submit your template.

### Step 2: Get Meta API Credentials

You need:
1. **Access Token** - Permanent system user token
2. **Phone Number ID** - Your WhatsApp Business Phone Number ID (15 digits)
3. **WABA ID** - WhatsApp Business Account ID (optional)

**How to get these:**
1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Create/select your app
3. Add WhatsApp product
4. Follow setup wizard
5. Create system user and generate permanent token
6. Get Phone Number ID from WhatsApp settings

### Step 3: Configure MunshiJee

Once your template is approved:

1. Start your dev server: `npm run dev`
2. Login as Super Admin
3. Go to **Settings** → **WhatsApp** tab
4. Fill in:
   ```
   Access Token: [Your Meta token]
   Phone Number ID: [Your 15-digit ID]
   API Version: v20.0
   Template Name: invoice_generation
   Template Language: en_US
   ```
5. Enter your WhatsApp test number
6. Click **Send Test Message**
7. Check your WhatsApp!

### Step 4: Test the Payment Page

#### Method 1: Direct URL Test
1. Create any invoice in MunshiJee
2. Copy the invoice ID from the URL
3. Visit: `http://localhost:3000/payment/[invoice-id]`
4. You should see the full invoice details with Pay Now button

#### Method 2: Via WhatsApp
1. Create an invoice with status "SENT"
2. Customer receives WhatsApp message
3. Customer clicks "Pay Now" button
4. Redirects to payment page

### Step 5: Test End-to-End Flow

1. **Create Test Invoice:**
   ```
   - Go to Invoices → Create Invoice
   - Fill in details
   - Set status to "SENT" (not DRAFT)
   - Save
   ```

2. **Check Notification Logs:**
   ```
   - Go to Admin → Notifications
   - Verify WhatsApp notification shows "SENT"
   - Check for any error messages
   ```

3. **Verify WhatsApp Message:**
   ```
   - Customer receives message with:
     ✓ Header: "New Invoice from MunshiJee"
     ✓ Body: Invoice details
     ✓ Button: "Pay Now"
   - Click button → Opens payment page
   ```

4. **Test Payment Page:**
   ```
   - Invoice details display correctly
   - All items show up
   - Pay Now button is visible
   - Design looks good on mobile
   ```

---

## 📋 Template Structure (For Reference)

### What Your WhatsApp Message Will Look Like:

```
┌─────────────────────────────────────┐
│ 📄 New Invoice from MunshiJee       │
├─────────────────────────────────────┤
│ Hi John Doe,                        │
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
│         [    Pay Now    ]           │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Template Not Found Error
- Wait a few minutes after approval
- Verify template name is exactly: `invoice_generation`
- Check language code is: `en_US`

### Test Message Fails
- Verify Access Token is valid
- Check Phone Number ID is correct (15 digits)
- Add test phone number in Meta dashboard first
- Ensure phone number format: `923001234567` (no +)

### Payment Page Not Loading
- Check invoice ID is valid
- Verify server is running: `npm run dev`
- Check API endpoint: `/api/payment/invoice/[id]`
- Review browser console for errors

### WhatsApp Message Not Sending
- Verify invoice status is "SENT" (not DRAFT)
- Check user has WhatsApp notifications enabled
- Verify active subscription with available quota
- Review logs in Admin → Notifications

---

## 💡 Tips

### For Testing
- Use Meta's test phone numbers initially
- Test with small amounts first
- Verify all template parameters populate correctly
- Check both mobile and desktop views

### For Production
- Use your live domain in template URL
- Update `munshiji.pk` to your actual domain
- Enable HTTPS for security
- Set up proper error monitoring
- Monitor WhatsApp quality rating

### Template Approval
- Usually takes 1-24 hours
- UTILITY category approves faster
- Avoid promotional language
- Use professional grammar
- Test thoroughly after approval

---

## 🎯 Future: Payment Gateway Integration

When ready to integrate payment gateway:

**Location to Add Code:** `src/app/payment/[invoiceId]/page.tsx`

**Function to Update:** `handlePayNow()`

Current code (line ~83):
```typescript
const handlePayNow = async () => {
  setPaying(true);
  // TODO: Integrate payment gateway here
  alert("Payment gateway coming soon!");
  setPaying(false);
};
```

**Replace with your payment gateway integration:**
```typescript
const handlePayNow = async () => {
  setPaying(true);
  try {
    // Call your payment gateway API
    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: invoice.id,
        amount: remainingBalance,
      }),
    });
    
    const data = await response.json();
    
    // Redirect to payment gateway
    window.location.href = data.paymentUrl;
  } catch (error) {
    alert('Payment failed. Please try again.');
    setPaying(false);
  }
};
```

---

## 📚 Related Files

- **`TEMPLATE_FOR_META.md`** - Complete template structure for Meta approval
- **`WHATSAPP_API_SETUP.md`** - Detailed WhatsApp Cloud API setup guide
- **`WHATSAPP_INTEGRATION.md`** - Technical integration documentation
- **`src/app/payment/[invoiceId]/page.tsx`** - Payment page component
- **`src/api/payment/invoice/[invoiceId]/route.ts`** - Payment API endpoint
- **`src/lib/whatsapp-service.ts`** - WhatsApp service implementation

---

## ✨ Summary

**You now have:**
1. ✅ Beautiful payment page at `/payment/[invoiceId]`
2. ✅ WhatsApp template structure ready for Meta approval
3. ✅ Full integration with Meta WhatsApp Cloud API
4. ✅ Notification logging for all messages
5. ✅ Test endpoint to verify configuration
6. ✅ Complete documentation

**Next Action:** Open `TEMPLATE_FOR_META.md` and submit your template to Meta! 🚀

---

**Questions?** Review the documentation files or check the notification logs in the admin panel for debugging.
