# Make.com Setup Guide for SessionId Integration

This guide explains how to configure Make.com to send back a `SessionId` after processing uploaded documents, which your React application will use to display related documents.

## Overview

Your React application expects Make.com to return a `SessionId` in the webhook response. This `SessionId` is then used to fetch and display all related documents (ID documents and certificates) on a second page.

## Step-by-Step Make.com Configuration

### 1. Create Your Make.com Scenario

1. **Log into Make.com** and create a new scenario
2. **Add a Webhook module** as the trigger (to receive file uploads)
3. **Configure the webhook** to accept file uploads

### 2. Process the Uploaded Documents

Add modules to process your documents:
- **Document processing modules** (OCR, data extraction, etc.)
- **Database operations** (store document data)
- **File storage** (save files to cloud storage)

### 3. Generate SessionId

Add a **Set Variable** or **Text Aggregator** module to generate a unique `SessionId`:

#### Option A: Using Make.com's Built-in Functions
```
{{replace(uuid(); "-"; "")}}
```

#### Option B: Custom Format with Date and Random Numbers
```
{{formatDate(now; "YYYYMMDD")}}_{{random(1000; 9999)}}_{{random(100000; 999999)}}
```

#### Option C: Using Database Auto-Increment
If you're using a database, you can:
1. Insert document records
2. Generate a unique `SessionId` 
3. Update the records with the `SessionId`

### 4. Store SessionId with Documents

Update your document records in the database to include the `SessionId`:

```sql
-- Example SQL for updating documents with SessionId
UPDATE documents 
SET session_id = '{{generated_session_id}}' 
WHERE upload_timestamp = '{{upload_timestamp}}'
```

### 5. Add Webhook Response Module

This is the crucial step - add a **Webhook Response** module at the end of your scenario:

#### Configure the Response Body:
```json
{
  "success": true,
  "message": "Documents uploaded and processed successfully",
  "SessionId": "{{generated_session_id}}",
  "documentCount": {{count_of_processed_documents}},
  "timestamp": "{{formatDate(now; 'YYYY-MM-DD HH:mm:ss')}}",
  "status": "completed"
}
```

#### Response Headers:
```
Content-Type: application/json
```

## Example Make.com Scenario Flow

```
1. Webhook (receives file upload)
   ↓
2. Document Processing (OCR, data extraction)
   ↓
3. Generate SessionId
   ↓
4. Store Documents in Database (with SessionId)
   ↓
5. Webhook Response (sends back SessionId)
```

## Database Schema Example

Based on your JSON files, here's the expected database structure:

### ID Documents Table
```sql
CREATE TABLE id_documents (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    first_name VARCHAR(255),
    date_of_birth DATE,
    id_number VARCHAR(255),
    issued_date DATE,
    valid_until DATE,
    role VARCHAR(255),
    flag BOOLEAN DEFAULT FALSE,
    id_type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Certificate Documents Table
```sql
CREATE TABLE certificate_documents (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    company_name_heb VARCHAR(255),
    business_id VARCHAR(255),
    issued_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Make.com Module Configuration Examples

### 1. Webhook Trigger Configuration
```
Name: Document Upload Webhook
URL: Your webhook URL
Method: POST
Content Type: multipart/form-data
```

### 2. SessionId Generation (Set Variable)
```
Variable Name: session_id
Value: {{replace(uuid(); "-"; "")}}
```

### 3. Database Insert (ID Documents)
```
Table: id_documents
Data:
- session_id: {{session_id}}
- last_name: {{extracted_data.last_name}}
- first_name: {{extracted_data.first_name}}
- date_of_birth: {{extracted_data.date_of_birth}}
- id_number: {{extracted_data.id_number}}
- role: {{extracted_data.role}}
- id_type: {{extracted_data.id_type}}
```

### 4. Database Insert (Certificate Documents)
```
Table: certificate_documents
Data:
- session_id: {{session_id}}
- company_name_heb: {{extracted_data.company_name}}
- business_id: {{extracted_data.business_id}}
- issued_date: {{extracted_data.issued_date}}
```

### 5. Webhook Response
```
Status: 200 OK
Body:
{
  "success": true,
  "message": "Documents processed successfully",
  "SessionId": "{{session_id}}",
  "documentCount": {{total_documents}},
  "timestamp": "{{formatDate(now; 'YYYY-MM-DD HH:mm:ss')}}"
}
```

## Testing Your Make.com Setup

### 1. Test the Webhook Response
Use a tool like Postman or curl to test your webhook:

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -F "file=@test_document.pdf" \
  -F "documentType=id"
```

### 2. Expected Response
Your webhook should return:
```json
{
  "success": true,
  "message": "Documents processed successfully",
  "SessionId": "9a8b6be09f4d4aebadde555efba0afcc",
  "documentCount": 2,
  "timestamp": "2025-08-04 14:17:14"
}
```

### 3. Test with Your React App
1. Upload a document through your React app
2. Check that the `SessionId` is received
3. Verify the documents view displays correctly

## Troubleshooting

### Common Issues

#### 1. SessionId Not Received
- **Check**: Webhook Response module is properly configured
- **Solution**: Ensure the `SessionId` field is included in the response body

#### 2. Database Records Not Created
- **Check**: Database connection and table structure
- **Solution**: Verify table names and column names match your schema

#### 3. Response Format Issues
- **Check**: JSON syntax in webhook response
- **Solution**: Use Make.com's JSON validator or test with a simple response first

#### 4. SessionId Generation Fails
- **Check**: Variable mapping in SessionId generation
- **Solution**: Test the SessionId generation separately before using it in database operations

### Debug Steps

1. **Add Logger modules** in Make.com to track data flow
2. **Test each module individually** before connecting them
3. **Check Make.com execution logs** for errors
4. **Verify database connections** and permissions
5. **Test webhook response** with a simple JSON payload first

## Advanced Configuration

### Error Handling
Add error handling to your scenario:

```
1. Webhook (receives file upload)
   ↓
2. Try/Catch Block
   ├─ Success Path: Process Documents → Generate SessionId → Send Response
   └─ Error Path: Send Error Response
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error processing documents",
  "error": "{{error_message}}",
  "timestamp": "{{formatDate(now; 'YYYY-MM-DD HH:mm:ss')}}"
}
```

### Multiple Document Types
If you're processing different document types, you can:

1. **Route documents** based on type
2. **Process each type** separately
3. **Use the same SessionId** for all documents in the upload
4. **Return summary** of all processed documents

## Security Considerations

1. **Validate file types** before processing
2. **Limit file sizes** to prevent abuse
3. **Use authentication** for your webhook if needed
4. **Sanitize extracted data** before storing in database
5. **Log all operations** for audit purposes

## Performance Optimization

1. **Process documents in parallel** when possible
2. **Use database transactions** for data consistency
3. **Implement retry logic** for failed operations
4. **Cache frequently used data** if applicable
5. **Monitor scenario execution times** and optimize slow modules

## Integration with Your React App

Once Make.com is configured, your React app will:

1. **Upload documents** to the Make.com webhook
2. **Receive SessionId** in the response
3. **Display documents** using the SessionId
4. **Show extracted data** in Hebrew with proper RTL support

The integration is now complete and ready for production use! 