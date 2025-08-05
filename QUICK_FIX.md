# Quick Fix for OneDrive Connection Issue

## הבעיה הנוכחית
המערכת מנסה להתחבר לשרת OneDrive על `localhost:3001` אבל השרת לא רץ.

## פתרון מהיר

### אפשרות 1: הפעלת השרת המקומי (לפיתוח)

1. **צור קובץ `server.js` בתיקיית הפרויקט:**
```bash
cd pdf-upload-react
cp server-api-example.js server.js
```

2. **התקן את התלויות:**
```bash
npm install express cors multer dotenv
```

3. **הפעל את השרת:**
```bash
npm run server
```

4. **בטרמינל נפרד, הפעל את האפליקציה:**
```bash
npm start
```

### אפשרות 2: שימוש ב-Firebase בלבד (פתרון זמני)

עדכן את `src/services/oneDriveService.js`:

```javascript
// הוסף פונקציה שתחזיר שגיאה ידידותית
async uploadFile(file, userEmail, folderPath = '') {
  console.log('[OneDrive] OneDrive service not available, using Firebase only');
  
  // החזר שגיאה ידידותית במקום לנסות להתחבר לשרת
  throw new Error('OneDrive service is currently unavailable. Please use Firebase upload only.');
}
```

### אפשרות 3: שינוי הקונפיגורציה לעבוד ישירות עם OneDrive

1. **עדכן את `src/config/api.config.js`:**
```javascript
const API_CONFIG = {
  development: {
    baseUrl: 'https://graph.microsoft.com/v1.0',
    oneDrive: {
      token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      upload: 'https://graph.microsoft.com/v1.0/me/drive/root:/{filename}:/content'
    }
  }
};
```

2. **עדכן את `oneDriveService.js` לעבוד ישירות עם Microsoft Graph API**

## בדיקת הפתרון

1. **בדוק שהשרת רץ:**
```bash
curl http://localhost:3001/health
```

2. **בדוק את הקונסול בדפדפן** - אמור לראות הודעות הצלחה במקום שגיאות חיבור

3. **נסה להעלות קובץ** - אמור לעבוד ללא שגיאות

## הודעות Console שצריכות להופיע:

```
[SERVER] Server running on port 3001
[SERVER] Environment: development
[OneDrive] Getting access token via proxy server...
[OneDrive] Using endpoint: http://localhost:3001/api/onedrive/token
[OneDrive] Access token obtained successfully via proxy
[OneDrive] Starting file upload to OneDrive via proxy server
[OneDrive] Uploading to endpoint: http://localhost:3001/api/onedrive/upload
[OneDrive] File uploaded successfully via proxy
```

## אם עדיין יש בעיות:

1. **בדוק שהפורט 3001 פנוי:**
```bash
netstat -an | grep 3001
```

2. **נסה פורט אחר:**
עדכן את `server.js`:
```javascript
const PORT = process.env.PORT || 3002;
```

3. **בדוק את ה-CORS:**
וודא שה-CORS מוגדר נכון ב-`server.js`

## לפתרון קבוע ל-Production:

ראה את הקובץ `PRODUCTION_SETUP.md` להוראות מלאות לפריסה ל-production. 