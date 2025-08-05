# Hybrid OneDrive Setup - Local + Firebase

## סקירה כללית

המערכת החדשה מזהה אוטומטית את הסביבה ומחליפה בין:
- **לוקלי**: שרת proxy על `localhost:3001`
- **Firebase**: עבודה ישירה עם OneDrive API

## איך זה עובד?

### זיהוי אוטומטי של הסביבה:
```javascript
// לוקלי: http://localhost:3000
// Firebase: https://your-app.firebaseapp.com

const isLocalhost = window.location.hostname === 'localhost';
const isFirebase = window.location.hostname.includes('firebaseapp.com');
```

### החלפה אוטומטית:
- **לוקלי** → משתמש ב-`oneDriveService.js` (proxy)
- **Firebase** → משתמש ב-`oneDriveDirectService.js` (ישיר)

## צעדים להגדרה:

### 1. הגדרת Azure AD App Registration

#### 1.1 צור App Registration חדש:
1. היכנס ל-[Azure Portal](https://portal.azure.com)
2. צור App Registration חדש:
   - **Name**: `YourApp-OneDrive-Hybrid`
   - **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI**: `http://localhost:3000` (לפיתוח)

#### 1.2 הגדר Authentication:
- **Platform**: `Single-page application (SPA)`
- **Redirect URIs**: 
  - `http://localhost:3000` (לוקלי)
  - `https://your-app.firebaseapp.com` (Firebase)
  - `https://your-app.web.app` (Firebase)
- **Implicit grant**: `Access tokens`, `ID tokens`

#### 1.3 הוסף API Permissions:
- **Microsoft Graph**
- **Delegated permissions**:
  - `Files.ReadWrite`
  - `Files.ReadWrite.All`
  - `User.Read`

### 2. עדכון הקונפיגורציה

עדכן את `src/config/azureAuth.js`:

```javascript
export const msalConfig = {
  auth: {
    clientId: "your-client-id-here", // מהקודם
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ["Files.ReadWrite", "Files.ReadWrite.All", "User.Read"]
};
```

### 3. החלפת השירות

במקום להשתמש ב-`oneDriveService.js`, השתמש ב-`oneDriveSmartService.js`:

```javascript
// במקום:
import oneDriveService from '../services/oneDriveService';

// השתמש ב:
import oneDriveSmartService from '../services/oneDriveSmartService';
```

### 4. עדכון הקומפוננטים

עדכן את הקומפוננטים שמשתמשים ב-OneDrive:

```javascript
// לפני:
const result = await oneDriveService.uploadFile(file, userEmail);

// אחרי:
const result = await oneDriveSmartService.uploadFile(file, userEmail);
```

## הגדרת השרת המקומי (לוקלי)

### 1. צור קובץ `server.js`:

```bash
cd pdf-upload-react
cp server-api-example.js server.js
```

### 2. התקן את התלויות:

```bash
npm install express cors multer dotenv
```

### 3. הפעל את השרת:

```bash
npm run server
```

### 4. בטרמינל נפרד, הפעל את האפליקציה:

```bash
npm start
```

## הגדרת Firebase (Production)

### 1. עדכן את Firebase configuration:

וודא שיש לך את כל המשתנים הנדרשים ב-`.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 2. פרוס ל-Firebase:

```bash
npm run build
firebase deploy
```

## בדיקת העבודה:

### לוקלי (localhost:3000):
```
[Environment] Current environment: { type: 'local', useProxy: true }
[OneDrive Smart] Getting access token using proxy method...
[OneDrive Smart] Uploading file via proxy server...
[OneDrive Smart] File uploaded successfully via proxy
```

### Firebase (your-app.firebaseapp.com):
```
[Environment] Current environment: { type: 'production', useDirect: true }
[OneDrive Smart] Getting access token using direct method...
[OneDrive Smart] Uploading file directly to OneDrive...
[OneDrive Smart] File uploaded successfully via direct connection
```

## דוגמה מלאה לשימוש:

```javascript
import React, { useState, useEffect } from 'react';
import oneDriveSmartService from '../services/oneDriveSmartService';
import { environment } from '../config/environment.config';

const OneDriveUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [environmentInfo, setEnvironmentInfo] = useState(null);

  useEffect(() => {
    // Log environment info
    setEnvironmentInfo(environment);
    console.log('[App] Environment info:', environment);
  }, []);

  // התחברות למשתמש
  const handleLogin = async () => {
    try {
      const userInfo = await oneDriveSmartService.getCurrentUser();
      if (!userInfo) {
        // המשתמש לא מחובר, יפתח חלון התחברות (רק ב-Firebase)
        if (!environment.useProxy) {
          await oneDriveSmartService.getAccessToken();
          const newUserInfo = await oneDriveSmartService.getCurrentUser();
          setUser(newUserInfo);
        } else {
          // בלוקלי, המשתמש כבר מחובר דרך השרת
          setUser({ username: 'local-user' });
        }
      } else {
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // העלאת קובץ
  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      console.log('[STEP 1] Starting OneDrive upload...');
      console.log('[STEP 1] Environment:', environment.type);
      console.log('[STEP 1] Mode:', await oneDriveSmartService.getCurrentMode());
      
      const result = await oneDriveSmartService.uploadFile(file, user?.username);
      
      console.log('[STEP 2] Upload completed:', result);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('[ERROR] Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Environment Info */}
      {environmentInfo && (
        <div style={{ 
          background: environmentInfo.isLocal ? '#e3f2fd' : '#f3e5f5',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '5px'
        }}>
          <strong>Environment:</strong> {environmentInfo.type}
          <br />
          <strong>Mode:</strong> {environmentInfo.useProxy ? 'Proxy Server' : 'Direct Connection'}
          <br />
          <strong>URL:</strong> {environmentInfo.fullUrl}
        </div>
      )}

      {!user ? (
        <button onClick={handleLogin}>
          {environment.useProxy ? 'התחבר (לוקלי)' : 'התחבר ל-OneDrive'}
        </button>
      ) : (
        <div>
          <p>מחובר כ: {user.username}</p>
          <input 
            type="file" 
            onChange={(e) => handleUpload(e.target.files[0])}
            disabled={isUploading}
          />
          {isUploading && <p>מעלה קובץ...</p>}
        </div>
      )}
    </div>
  );
};
```

## פתרון בעיות:

### בעיה: "Local server not available"
**פתרון:** הפעל את השרת המקומי:
```bash
npm run server
```

### בעיה: "AADSTS700016: Application not found"
**פתרון:** בדוק שה-Client ID נכון ב-`azureAuth.js`

### בעיה: "CORS error" (ב-Firebase)
**פתרון:** וודא שה-Origin מוגדר נכון ב-Azure App Registration

### בעיה: "Proxy connection refused" (בלוקלי)
**פתרון:** 
1. בדוק שהשרת רץ על פורט 3001
2. בדוק שאין firewall שחוסם
3. נסה פורט אחר

## יתרונות המערכת ההיברידית:

### ✅ **לוקלי:**
- פשוט לפיתוח
- אין צורך בהגדרות Azure מורכבות
- מהיר לבדיקות

### ✅ **Firebase:**
- אין צורך בשרת backend
- חסכוני
- מהיר ופשוט

### ✅ **אוטומטי:**
- מזהה את הסביבה אוטומטית
- מחליף בין השיטות
- Fallback אוטומטי

## לסיכום:

המערכת ההיברידית נותנת לך את הטוב משני העולמות:
- **לוקלי**: עבודה פשוטה עם שרת proxy
- **Firebase**: עבודה ישירה ללא שרת
- **אוטומטי**: החלפה חכמה בין השיטות

זה הפתרון האופטימלי לפיתוח ופריסה! 