# WhatsApp Notification Troubleshooting Guide

## Problem
Invoice generation sends email successfully, but WhatsApp notifications are not being sent.

## What I've Added

### 1. Logs Page (`/logs`)
- **New page** at `/logs` where you can view all notification logs
- **Most recent logs appear first** (sorted by creation date descending)
- **Filters available**: Type (Email/SMS/WhatsApp) and Status (Sent/Failed/Pending)
- **Statistics dashboard** showing sent, failed, and pending counts for each channel
- **Error details** displayed in red boxes for failed notifications
- **Pagination** support for browsing through logs
- **Added to navigation** in both customer and admin sidebars

### 2. API Endpoint
- **New endpoint**: `GET /api/logs`
- Returns notification logs filtered by user (regular users see only their logs)
- Supports pagination and filtering by type/status

### 3. Enhanced Error Logging
- Added detailed console logging for WhatsApp notification attempts
- Now logs why WhatsApp was skipped (disabled, not configured, no phone, quota exceeded)
- Better error messages stored in the database for debugging

### 4. Admin Page Updates
- Updated admin notifications page to include WhatsApp statistics
- Fixed icon display for WhatsApp notifications

## Common Reasons WhatsApp Fails

Based on the code analysis, WhatsApp notifications will **NOT be sent** if any of these conditions are true:

### 1. **WhatsApp Notifications Disabled**
   - Check: User settings → WhatsApp notifications toggle
   - Location: Settings page or database `users.whatsappNotificationsEnabled`

### 2. **WhatsApp Settings Not Configured**
   - Check: Settings → WhatsApp configuration
   - Required settings:
     - Access Token
     - Phone Number ID
     - Template Name
   - Location: Database `settings` table with keys `whatsapp_provider` and `whatsapp_config`

### 3. **Customer Has No Phone Number**
   - Check: Customer details page
   - The customer must have a phone number in their profile
   - Location: Database `customers.phone`

### 4. **WhatsApp Quota Exceeded**
   - Check: Your subscription usage on the subscription page
   - Example: Free plan might be 0/10 WhatsApp messages
   - When quota is reached, WhatsApp notifications are automatically disabled
   - Location: Database `userSubscriptions.whatsappUsed` vs `subscriptionPlans.whatsappLimit`

### 5. **No Active Subscription**
   - The system requires an active subscription to send notifications
   - Check: Settings → Subscription page

### 6. **WhatsApp API Error**
   - Meta/Facebook WhatsApp Business API might return an error
   - Common errors:
     - Invalid access token
     - Template not approved
     - Phone number not verified
     - Rate limiting
     - Invalid phone number format

## How to Debug

### Step 1: Check the Logs Page
1. Go to `/logs` in your application
2. Filter by "WhatsApp" in the type dropdown
3. Look for:
   - **PENDING** entries: Request started but never completed
   - **FAILED** entries: Check the red error message box for details
   - **No entries**: WhatsApp notification was never attempted

### Step 2: Check the Console
If you have access to server logs, look for messages like:
- `"WhatsApp notifications disabled for user..."`
- `"WhatsApp settings not configured for user..."`
- `"Customer has no phone number for WhatsApp"`
- `"User has reached WhatsApp quota limit"`
- `"Failed to send WhatsApp for invoice..."`

### Step 3: Verify Settings
1. Go to Settings page
2. Check that WhatsApp is configured with:
   - Provider: Meta
   - Access Token
   - Phone Number ID
   - Template Name
3. Ensure "Enable WhatsApp Notifications" toggle is ON

### Step 4: Verify Customer Phone
1. Go to Customers page
2. Find the customer you sent the invoice to
3. Verify they have a phone number
4. Phone should be in format: `03001234567` or `923001234567`

### Step 5: Check Subscription Limits
1. Go to Settings → Subscription
2. Check WhatsApp usage (e.g., "0 / 10")
3. Verify you haven't exceeded the limit

## Phone Number Format
The system automatically formats phone numbers:
- Removes all non-digit characters
- If starts with `0`, replaces with `92` (Pakistan)
- If doesn't start with `92`, prepends `92`
- Example: `0300-1234567` → `923001234567`

## Next Steps
1. **Visit `/logs`** to see if WhatsApp attempts were made
2. **Check the error message** in failed logs (if any)
3. **Verify your WhatsApp settings** are correctly configured
4. **Ensure customer has a phone number**
5. **Check subscription limits**

If after checking all of the above the issue persists, the error details in the logs page will help identify the exact Meta/WhatsApp API error.
