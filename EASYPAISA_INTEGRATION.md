# EasyPaisa Payment Gateway Integration - Implementation Summary

## Overview

The EasyPaisa payment gateway has been successfully integrated into MunshiJee. This integration allows customers to pay invoices directly through EasyPaisa using either Mobile Account (MA) or Over-the-Counter (OTC) payment methods.

## What Has Been Implemented

### 1. Database Schema ✅

**New Enums:**
- `EasypaisaTransactionStatus`: PENDING, PAID, FAILED, EXPIRED, BLOCKED
- `EasypaisaTransactionType`: MA (Mobile Account), OTC (Over The Counter)
- Updated `PaymentMethod` to include `EASYPAISA`

**New Model: `EasypaisaTransaction`**
Tracks all EasyPaisa payment transactions with full audit trail including:
- Order ID, transaction type, amount
- Payment tokens and expiry dates
- Transaction status and response codes
- Links to Invoice, User, and Customer

### 2. Backend Service Layer ✅

**`src/lib/easypaisa-service.ts`**
- `EasypaisaService` class with methods for:
  - `initiateMATransaction()` - Mobile Account payments
  - `initiateOTCTransaction()` - Over-the-counter payments
  - `inquireTransactionStatus()` - Check payment status
- Supports both sandbox and production environments
- Automatic response code mapping with user-friendly messages
- `getEasypaisaSettings()` helper to load configuration

### 3. API Routes ✅

**Payment Initiation:**
- `POST /api/easypaisa/initiate` - Start MA or OTC payment
  - Validates invoice and user permissions
  - Creates transaction record in database
  - Calls EasyPaisa API and returns payment token

**Status & Callback Handling:**
- `GET /api/easypaisa/callback` - IPN notification handler (public endpoint)
  - Receives notifications from EasyPaisa
  - Updates transaction status
  - Auto-creates Payment record when status is PAID
- `GET /api/easypaisa/status/[orderId]` - Manual status polling
  - Allows frontend to check payment status
  - Creates Payment record if successful

**Transaction Management:**
- `GET /api/easypaisa/transactions` - List all EasyPaisa transactions
  - Supports pagination and filtering
  - Scoped by user (regular users see only their transactions)

### 4. Super Admin Settings UI ✅

**New "Payment Gateway" Tab** (`/settings`)
- Added to super admin settings page alongside Email and SMS tabs
- Configure EasyPaisa credentials:
  - Environment toggle (Sandbox/Production)
  - Merchant Username and Password
  - Store ID
  - Account Number (EWP)
- Test Connection button to verify credentials
- Settings stored globally in database (`userId: null`)

### 5. Payment UI Enhancement ✅

**Updated `mark-paid-sheet.tsx`**
- Two-tab interface:
  - **Manual Payment**: Original manual payment recording
  - **Pay via EasyPaisa**: New gateway payment flow
  
**EasyPaisa Payment Flow:**
1. Select transaction type (MA or OTC)
2. Enter mobile number (for MA transactions)
3. Initiate payment - gets payment token
4. Display payment details and status
5. Auto-poll for payment status (every 5 seconds)
6. Show success/failure status with visual indicators
7. Automatically mark invoice as paid when confirmed

### 6. Validation & Type Safety ✅

**Zod Schemas:**
- `easypaisaInitiateSchema` - Validates payment initiation requests
- `easypaisaSettingsSchema` - Validates configuration settings
- Updated `paymentSchema` to include EASYPAISA method

## How to Use

### For Super Admin - Initial Setup

1. **Register with EasyPaisa:**
   - Apply for merchant account at [EasyPaisa Merchant Portal](https://easypay.easypaisa.com.pk/easypay-merchant/)
   - Complete KYC verification
   - Receive merchant credentials (username, password, store ID, account number)

2. **Configure in MunshiJee:**
   - Log in as super admin
   - Go to Settings → Payment Gateway tab
   - Enter your EasyPaisa credentials
   - Start with "Sandbox" environment for testing
   - Click "Test Connection" to verify
   - Save settings

3. **Configure IPN Callback:**
   - In EasyPaisa Merchant Portal, set IPN listener URL to:
     ```
     https://yourdomain.com/api/easypaisa/callback
     ```
   - This enables automatic payment confirmations

4. **Go Live:**
   - After testing, switch environment to "Production"
   - Update with production credentials
   - Save settings

### For Users - Making Payments

1. **Navigate to Invoice:**
   - Go to Invoices page
   - Select an unpaid invoice

2. **Choose Payment Method:**
   - Click "Mark as Paid" or payment button
   - Select "Pay via EasyPaisa" tab

3. **Select Payment Type:**
   - **Mobile Account (MA)**: Direct payment from EasyPaisa wallet
     - Enter your 11-digit mobile number
     - Receive payment request on your phone
     - Approve on EasyPaisa app
   - **Over The Counter (OTC)**: Pay at EasyPaisa shop
     - Get payment token displayed on screen
     - Visit any EasyPaisa shop within 24 hours
     - Provide token to complete payment

4. **Wait for Confirmation:**
   - System automatically checks payment status
   - Invoice marked as paid when payment confirmed
   - Payment record created automatically

## Technical Architecture

```
User → Frontend (Mark Paid Sheet)
  ↓
POST /api/easypaisa/initiate
  ↓
EasyPaisa Service → EasyPaisa API
  ↓
Database: Create EasypaisaTransaction (PENDING)
  ↓
Return payment token to user
  ↓
[User completes payment]
  ↓
EasyPaisa → GET /api/easypaisa/callback (IPN)
  OR
Frontend → GET /api/easypaisa/status/[orderId] (Polling)
  ↓
Update EasypaisaTransaction status
  ↓
If PAID: Create Payment record + Update Invoice status
```

## API Endpoints Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/easypaisa/initiate` | POST | Yes | Initiate payment |
| `/api/easypaisa/callback` | GET | No | IPN callback handler |
| `/api/easypaisa/status/[orderId]` | GET | Yes | Check transaction status |
| `/api/easypaisa/transactions` | GET | Yes | List transactions |
| `/api/settings` | GET/PUT | Yes | Manage settings |

## EasyPaisa Response Codes

| Code | Meaning |
|------|---------|
| 0000 | SUCCESS |
| 0001 | System error |
| 0002 | Required field missing |
| 0005 | Merchant account not active |
| 0006 | Invalid store ID |
| 0007 | Store not active |
| 0008 | Payment method not enabled |
| 0010 | Invalid credentials |
| 0013 | Insufficient balance |
| 0014 | Account does not exist |
| 0015 | Invalid/expired token |

## Testing Guidelines

### In Sandbox Mode:

1. Use test credentials provided by EasyPaisa
2. Test phone numbers are restricted (provided by EasyPaisa)
3. Test amount usually limited to Rs. 10.00
4. All transactions are simulated

### Testing Checklist:

- [ ] Configure sandbox credentials
- [ ] Test connection from settings page
- [ ] Initiate MA transaction with test number
- [ ] Initiate OTC transaction
- [ ] Verify payment token generation
- [ ] Test status polling
- [ ] Verify IPN callback (if configured)
- [ ] Check Payment record creation
- [ ] Verify Invoice status update to PAID
- [ ] Review EasypaisaTransaction records

## Database Migrations

Migration has been created and applied:
- `20260414182320_add_easypaisa_integration`

If you need to apply it on another database:
```bash
npx prisma migrate deploy --schema=./src/prisma/schema.prisma
```

## Environment Variables

Optional environment variables (recommended to use settings UI instead):
```env
EASYPAISA_USERNAME=""
EASYPAISA_PASSWORD=""
EASYPAISA_STORE_ID=""
EASYPAISA_ACCOUNT_NUM=""
EASYPAISA_ENVIRONMENT="sandbox"
```

## Security Considerations

1. **Credentials Storage**: All credentials stored encrypted in database
2. **API Authentication**: Payment initiation requires user authentication
3. **Authorization**: Users can only pay their own invoices (or super admin)
4. **IPN Verification**: Callback endpoint verifies transaction against database
5. **Token Expiry**: Payment tokens expire after 24 hours
6. **Audit Trail**: Complete transaction history maintained

## Troubleshooting

### Common Issues:

**"EasyPaisa payment gateway is not configured"**
- Solution: Super admin needs to configure credentials in Settings → Payment Gateway

**"Invalid credentials" (Response Code: 0010)**
- Solution: Verify username and password in settings
- Check if using correct environment (sandbox vs production)

**"Invalid store ID" (Response Code: 0006)**
- Solution: Verify Store ID with EasyPaisa merchant team

**Payment stuck in PENDING status:**
- Check IPN callback URL is configured correctly
- Manually check status using the status inquiry endpoint
- Verify transaction in EasyPaisa Merchant Portal

**Transaction FAILED immediately:**
- Review response code and description
- Check EasyPaisa account is active
- Verify payment method is enabled in merchant account

## Next Steps

1. **Apply for EasyPaisa Merchant Account** (if not done)
2. **Configure credentials in sandbox mode**
3. **Test the integration thoroughly**
4. **Configure IPN callback URL in merchant portal**
5. **Switch to production when ready**
6. **Monitor transactions in the transactions list**

## Support

For EasyPaisa-specific issues:
- Call: 62632
- Email: businesspartnersupport@telenorbank.pk

For application issues:
- Review logs in the application
- Check transaction records in database
- Contact your development team

## Files Created/Modified

### Created:
- `src/lib/easypaisa-service.ts`
- `src/components/settings/easypaisa-settings-form.tsx`
- `src/app/api/easypaisa/initiate/route.ts`
- `src/app/api/easypaisa/callback/route.ts`
- `src/app/api/easypaisa/status/[orderId]/route.ts`
- `src/app/api/easypaisa/transactions/route.ts`

### Modified:
- `src/prisma/schema.prisma` (added EasyPaisa models and enums)
- `src/lib/validators.ts` (added validation schemas)
- `src/app/api/settings/route.ts` (extended for EasyPaisa config)
- `src/app/settings/page.tsx` (added Payment Gateway tab)
- `src/components/invoices/mark-paid-sheet.tsx` (added EasyPaisa payment flow)
- `.env.example` (added optional EasyPaisa variables)

---

**Integration completed successfully! All features are ready to use once you configure your EasyPaisa merchant credentials.**
