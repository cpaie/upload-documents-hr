# Security Guide - Hybrid OneDrive System

## 🔒 קבצים שצריכים להיות מוגנים

### קבצים שכבר ב-`.cursorignore`:
```
✅ .env (כל הגרסאות)
✅ src/config/azureAuth.js
✅ src/config/firebase.config.js
✅ src/config/webhook.config.js
✅ src/config/environment.config.js
✅ server.js
```

### קבצים נוספים שכדאי להוסיף ל-`.cursorignore`:
```
# Add these to .cursorignore if they contain secrets:
src/services/oneDriveService.js
src/services/oneDriveDirectService.js
src/services/oneDriveSmartService.js
src/services/firebaseService.js
src/services/documentsService.js
```

## 🔑 משתני סביבה נדרשים

### משתנים חיוניים (חובה):

#### Azure AD / OneDrive:
```env
REACT_APP_AZURE_CLIENT_ID=your-client-id
REACT_APP_AZURE_TENANT_ID=your-tenant-id
```

#### Firebase:
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket
```

#### Webhook:
```env
REACT_APP_WEBHOOK_URL=your-webhook-url
REACT_APP_WEBHOOK_API_KEY=your-api-key
```

### משתנים אופציונליים (לוקלי בלבד):
```env
ONEDRIVE_CLIENT_SECRET=your-client-secret
ONEDRIVE_ACCESS_TOKEN=your-access-token
JWT_SECRET=your-jwt-secret
```

## 🛡️ כללי אבטחה

### 1. **אל תעשה:**
❌ אל תכניס סודות לקוד
❌ אל תעלה קבצי `.env` ל-Git
❌ אל תשתף Client Secrets
❌ אל תשים סודות ב-`localStorage`

### 2. **עשה:**
✅ השתמש במשתני סביבה
✅ הגן על קבצי קונפיגורציה
✅ השתמש ב-`sessionStorage` במקום `localStorage`
✅ סובב מפתחות באופן קבוע

## 📁 מבנה קבצים מומלץ

```
pdf-upload-react/
├── .env                    # 🔒 לא ב-Git
├── .env.example           # ✅ ב-Git (דוגמה)
├── .env.hybrid.example    # ✅ ב-Git (דוגמה)
├── src/
│   ├── config/
│   │   ├── azureAuth.js   # 🔒 לא ב-Git
│   │   ├── firebase.config.js # 🔒 לא ב-Git
│   │   └── webhook.config.js  # 🔒 לא ב-Git
│   └── services/
│       ├── oneDriveService.js      # 🔒 לא ב-Git
│       ├── oneDriveDirectService.js # 🔒 לא ב-Git
│       └── oneDriveSmartService.js  # 🔒 לא ב-Git
└── server.js              # 🔒 לא ב-Git
```

## 🔧 הגדרת Azure AD בטוחה

### 1. **App Registration:**
- צור App Registration חדש לכל סביבה
- השתמש ב-Client ID שונה ללוקלי ול-Firebase
- הגדר Redirect URIs נכון

### 2. **API Permissions:**
```
Microsoft Graph > Delegated:
- Files.ReadWrite
- Files.ReadWrite.All  
- User.Read
```

### 3. **Authentication:**
```
Platform: Single-page application (SPA)
Redirect URIs:
- http://localhost:3000 (לוקלי)
- https://your-app.firebaseapp.com (Firebase)
```

## 🔥 הגדרת Firebase בטוחה

### 1. **Security Rules:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. **Storage Rules:**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🌐 הגדרת Webhook בטוחה

### 1. **Make.com (Integromat):**
- השתמש ב-API Key חזק
- הגבל IP addresses
- השתמש ב-HTTPS בלבד

### 2. **Webhook Security:**
```javascript
// בדיקת API Key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.WEBHOOK_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
```

## 🚨 בדיקות אבטחה

### 1. **בדוק שהקבצים לא ב-Git:**
```bash
# בדוק אם יש קבצי .env ב-Git
git ls-files | grep -E "\.env$"

# בדוק אם יש סודות בקוד
grep -r "your-client-id" src/
grep -r "your-api-key" src/
```

### 2. **בדוק הרשאות קבצים:**
```bash
# הגדר הרשאות נכונות
chmod 600 .env
chmod 600 src/config/*.js
```

### 3. **בדוק משתני סביבה:**
```javascript
// בדוק שהמשתנים קיימים
if (!process.env.REACT_APP_AZURE_CLIENT_ID) {
  console.error('Missing Azure Client ID');
}
```

## 📋 רשימת בדיקה

### לפני פריסה:
- [ ] כל קבצי `.env` ב-`.gitignore`
- [ ] כל קבצי קונפיגורציה ב-`.cursorignore`
- [ ] אין סודות בקוד
- [ ] משתני סביבה מוגדרים נכון
- [ ] הרשאות Azure AD נכונות
- [ ] Firebase Security Rules מוגדרות
- [ ] Webhook API Key מוגדר

### אחרי פריסה:
- [ ] בדוק שהאפליקציה עובדת
- [ ] בדוק שאין שגיאות בקונסול
- [ ] בדוק שהעלאות עובדות
- [ ] בדוק שהאותנטיקציה עובדת

## 🆘 במקרה של דליפת סודות

### 1. **מיד:**
- שנה את כל המפתחות
- בטל את ה-App Registration הישן
- צור App Registration חדש

### 2. **בדוק:**
- איזה קבצים נחשפו
- מתי נחשפו
- מי יכול לגשת אליהם

### 3. **תקן:**
- מחק את הקבצים מה-Git history
- עדכן את כל הסודות
- בדוק שאין סודות חדשים

## 📞 תמיכה

אם יש לך שאלות על אבטחה:
1. בדוק את הקובץ הזה
2. בדוק את התיעוד של Azure AD
3. בדוק את התיעוד של Firebase
4. פנה לתמיכה טכנית

**זכור: אבטחה היא אחריות של כולנו! 🔒** 