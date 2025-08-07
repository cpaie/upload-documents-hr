// Webhook Configuration
// All values must be set in environment variables (.env file)
// No hardcoded fallback values for security

export const webhookConfig = {
  // Default webhook URL - must be set in .env
  defaultUrl: process.env.REACT_APP_WEBHOOK_URL,
  // Default API key - must be set in .env
  defaultApiKey: process.env.REACT_APP_WEBHOOK_API_KEY,
  // Webhook timeout in milliseconds (5 minutes default for large file uploads)
  timeout: parseInt(process.env.REACT_APP_WEBHOOK_TIMEOUT) || 300000,
  // Maximum retry attempts
  maxRetries: parseInt(process.env.REACT_APP_WEBHOOK_MAX_RETRIES) || 3,
  // Request headers
  headers: {
    'Content-Type': 'multipart/form-data',
    'x-make-apikey': process.env.REACT_APP_WEBHOOK_API_KEY
  }
};