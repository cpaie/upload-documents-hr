# Webhook Troubleshooting Guide

## Issue: Webhook not triggering when clicking "Upload Documents"

If your Make.com webhook is not triggering and you're not seeing any error messages, follow this troubleshooting guide.

## Step 1: Check Configuration Status

The app now shows a configuration status at the top of the upload form. Look for:

- ✅ **Webhook URL: Configured** - Your webhook URL is set
- ✅ **API Key: Configured** - Your API key is set
- ❌ **Webhook URL: Not Configured** - Missing webhook URL
- ❌ **API Key: Not Configured** - Missing API key

## Step 2: Create .env File (If Missing)

If you see "Not Configured" status, create a `.env` file in the project root:

```bash
# Create .env file in pdf-upload-react directory
touch .env
```

Add your Make.com webhook configuration:

```env
# Webhook Configuration (REQUIRED)
REACT_APP_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-url
REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key
REACT_APP_WEBHOOK_TIMEOUT=30000
REACT_APP_WEBHOOK_MAX_RETRIES=3
```

## Step 3: Get Your Make.com Webhook Details

1. **Log into Make.com** (formerly Integromat)
2. **Create or open your scenario**
3. **Add a Webhook module** (HTTP > Webhooks)
4. **Copy the webhook URL** (starts with `https://hook.us2.make.com/`)
5. **Copy the API key** (if required)

## Step 4: Test Your Webhook Configuration

Run the test script to verify your configuration:

```bash
cd pdf-upload-react
node test-webhook.js
```

This will:
- Check if your `.env` file exists
- Verify your webhook URL and API key are set
- Test the connection to Make.com
- Show detailed error messages if something fails

## Step 5: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for detailed logs:

1. **Look for configuration errors:**
   ```
   [ERROR] Webhook URL not configured
   [ERROR] API key not configured
   ```

2. **Look for network errors:**
   ```
   [ERROR] Network error - possible CORS issue or invalid URL
   [ERROR] Request timed out after 30000ms
   ```

3. **Look for successful requests:**
   ```
   [STEP 11] HTTP request sent successfully
   [STEP 12] Response is successful (status 200-299)
   ```

## Step 6: Common Issues and Solutions

### Issue: "Webhook URL not configured"
**Solution:** Create `.env` file with `REACT_APP_WEBHOOK_URL=your-webhook-url`

### Issue: "API key not configured"
**Solution:** Add `REACT_APP_WEBHOOK_API_KEY=your-api-key` to `.env` file

### Issue: "Network error - possible CORS issue"
**Solutions:**
1. Check if your webhook URL is correct
2. Verify your Make.com webhook is active
3. Check if your API key is valid
4. Try testing with the `test-webhook.js` script

### Issue: "Request timed out"
**Solutions:**
1. Check your internet connection
2. Verify the webhook URL is accessible
3. Increase timeout in `.env`: `REACT_APP_WEBHOOK_TIMEOUT=60000`

### Issue: "HTTP 401/403/404 errors"
**Solutions:**
1. Check your API key is correct
2. Verify your webhook URL is valid
3. Make sure your Make.com scenario is active

## Step 7: Restart Development Server

After creating or modifying the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm start
```

## Step 8: Verify Make.com Webhook Setup

1. **Check webhook is active** in Make.com
2. **Verify webhook accepts POST requests**
3. **Check webhook accepts multipart/form-data**
4. **Test webhook manually** in Make.com interface

## Step 9: Debug Mode

The app now includes extensive console logging. Check the browser console for:

- `[STEP 1]` through `[STEP 14]` - Detailed upload process
- `[ERROR]` messages - Specific error details
- Request/response details - Network communication info

## Step 10: Manual Testing

If the app still doesn't work, test manually:

1. **Use the test script:**
   ```bash
   node test-webhook.js
   ```

2. **Test with curl:**
   ```bash
   curl -X POST \
     -H "x-make-apikey: your-api-key" \
     -F "pdf1=@test.pdf" \
     -F "pdf2=@test2.pdf" \
     https://hook.us2.make.com/your-webhook-url
   ```

## Still Having Issues?

1. **Check Make.com logs** for incoming requests
2. **Verify webhook URL format** (should start with `https://hook.us2.make.com/`)
3. **Test with a simple JSON payload** first
4. **Check browser network tab** for failed requests
5. **Verify no firewall/proxy blocking** the requests

## Support

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Run the test script and share the output
3. Verify your Make.com webhook configuration
4. Check if the issue persists in different browsers 