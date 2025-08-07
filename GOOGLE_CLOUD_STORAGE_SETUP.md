# Google Cloud Storage Setup Guide

## הוראות התקנה מהירות

### 1. צור Bucket ב-Google Cloud Storage

1. **עבור ל-[Google Cloud Console](https://console.cloud.google.com/)**
2. **בחר פרויקט או צור חדש**
3. **עבור ל-Cloud Storage > Buckets**
4. **לחץ על "Create Bucket"**
5. **בחר שם ייחודי לבאקט** (למשל: `my-pdf-uploads-123`)
6. **בחר מיקום** (לרוב: Region או Multi-region)
7. **לחץ Create**

### 2. צור Service Account

1. **עבור ל-IAM & Admin > Service Accounts**
2. **לחץ על "Create Service Account"**
3. **תן שם לחשבון** (למשל: `pdf-uploader`)
4. **הוסף את התפקיד:** `Storage Object Admin`
5. **לחץ Done**

### 3. צור Key עבור Service Account

1. **לחץ על ה-Service Account שיצרת**
2. **עבור ל-Keys**
3. **לחץ על "Add Key" > "Create New Key"**
4. **בחר JSON**
5. **הורד את הקובץ ושמור אותו בתיקיית הפרויקט בשם:** `gcs-service-account-key.json`

### 4. הגדר את קובץ ה-.env

צור קובץ `.env` בתיקיית `pdf-upload-react` עם התוכן הבא:

```env
# Google Cloud Storage Configuration
GCS_PROJECT_ID=your-project-id-here
GCS_BUCKET_NAME=your-bucket-name-here
GCS_SERVICE_ACCOUNT_KEY_FILE=./gcs-service-account-key.json

# Webhook Configuration (Make.com)
REACT_APP_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-url
REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key
```

### 5. מידע שאתה צריך:

1. **Project ID** - תמצא אותו ב-Dashboard של Google Cloud Console
2. **Bucket Name** - השם שנתת לבאקט ב-שלב 1
3. **Service Account Key File** - קובץ ה-JSON שהורדת ב-שלב 3

### 6. הפעל את השרתים

```bash
cd pdf-upload-react
npm run dev
```

## יתרונות Google Cloud Storage על פני Google Drive

✅ **פשוט יותר** - אין צורך ב-OAuth מורכב  
✅ **יציב יותר** - נבנה להעלאות קבצים בכמויות גדולות  
✅ **מהיר יותר** - ביצועים טובים יותר  
✅ **זול יותר** - תשלום רק על מה שאתה משתמש  
✅ **אמין יותר** - 99.999% זמינות  

## בעיות נפוצות

### שגיאה: "Project ID not found"
- וודא שה-Project ID נכון בקובץ `.env`
- וודא שהפרויקט קיים ב-Google Cloud

### שגיאה: "Service account key file not found"  
- וודא שקובץ ה-JSON נמצא בתיקיית הפרויקט
- וודא שהנתיב בקובץ `.env` נכון

### שגיאה: "Permission denied"
- וודא שה-Service Account קיבל את התפקיד `Storage Object Admin`
- וודא שהבאקט קיים ונגיש

## תמיכה

אם נתקלת בבעיות, בדוק את הקונסול בדפדפן ואת הלוגים של השרת לפרטים נוספים.
