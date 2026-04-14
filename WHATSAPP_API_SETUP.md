# WhatsApp API Setup Guide

## Wati.io Setup Instructions

### 1. Get Your API Credentials

1. Login to your Wati.io dashboard at https://app.wati.io
2. Go to **Settings** → **API Docs** or **API Access**
3. Copy your **Access Token**
4. Note your **API Endpoint URL** (usually in format: `https://live-server-xxxxx.wati.io`)

### 2. Configure in MunshiJee

In the MunshiJee Settings page (WhatsApp tab):

1. **Provider**: Select "Wati.io"
2. **Access Token**: Paste your Wati access token (REMOVE the "Bearer " prefix if it's there)
   - ✅ Correct: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - ❌ Wrong: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...`
3. **API Endpoint**: Enter your complete Wati API URL including account ID
   - ✅ Correct: `https://live-mt-server.wati.io/101344347`
   - ❌ Wrong: `https://live-mt-server.wati.io`
   
   **Important**: Use the EXACT URL shown in your Wati dashboard API Docs section.

### 3. Test Phone Number Format

When testing, make sure:
- Phone number is in international format
- For Pakistan: `923001234567` or `+923001234567`
- The system will automatically format it correctly

### 4. Common Issues & Solutions

#### 404 - Not Found
- **Cause**: Incorrect API endpoint URL
- **Solution**: Make sure you're using only the base URL (e.g., `https://live-server-12345.wati.io`)
- **Check**: Your API endpoint in Wati dashboard

#### 401 - Unauthorized
- **Cause**: Invalid or expired access token
- **Solution**: Generate a new access token from Wati dashboard

#### 403 - Forbidden OR "message text can not be empty"
- **Cause**: Phone number has no active conversation session
- **Solution**: 
  1. **CRITICAL**: The recipient MUST send a message to your Wati WhatsApp Business number FIRST
  2. Messages can only be sent within 24 hours after the recipient messages you
  3. For testing: Send a "Hi" from your test number to your Wati number, then try again
  4. For production: Use template messages for first contact, session messages for replies

### 5. Wati API Endpoints

Wati provides different types of message endpoints:

1. **Session Message** (Current implementation)
   - Endpoint: `/api/v1/sendSessionMessage`
   - Requires: Active 24-hour session window
   - Use: For customers who messaged you first

2. **Template Message** (Alternative)
   - Endpoint: `/api/v1/sendTemplateMessage`
   - Requires: Pre-approved template
   - Use: For initiating conversations

### 6. Phone Number Requirements

- Must include country code
- For Pakistan: Start with `92` (without leading 0)
- System automatically formats: `0300-1234567` → `923001234567`

### 7. Testing Checklist

Before testing, verify:
- [ ] Wati access token is valid
- [ ] API endpoint is correct base URL only
- [ ] Test phone number has an active WhatsApp session with your Wati number
- [ ] Phone number is saved in customer database

## Barty.io Setup Instructions

### 1. Get Your API Credentials

1. Login to Barty.io
2. Get your **Bearer Token**
3. Get your **API Endpoint**
4. (Optional) Get your **Phone Number ID**

### 2. Configure in MunshiJee

1. **Provider**: Select "Barty.io"
2. **Bearer Token**: Paste your token
3. **API Endpoint**: Enter base URL
4. **Phone Number ID**: (Optional)

## Need Help?

If you continue to face issues:
1. Check the terminal/console logs for detailed error messages
2. Verify your Wati/Barty dashboard for API access
3. Test with Postman/curl first to isolate the issue
4. Contact Wati/Barty support for API access issues
