# Direct OneDrive Integration Setup

## למה לעבור לעבודה ישירה?

### יתרונות:
✅ **אין צורך בשרת backend** - הכל עובד מהדפדפן  
✅ **פשוט יותר** - פחות קומפוננטים לתחזוקה  
✅ **חסכוני** - אין עלויות שרת  
✅ **מהיר יותר** - פחות hops ברשת  

### חסרונות:
❌ **פחות אבטחה** - ה-Client ID גלוי בקוד  
❌ **CORS** - צריך להגדיר נכון  
❌ **אותנטיקציה** - המשתמש צריך להתחבר בכל פעם  

## צעדים להגדרה:

### 1. הגדרת Azure AD App Registration

1. **היכנס ל-Azure Portal:**
   ```
   https://portal.azure.com
   ```

2. **צור App Registration חדש:**
   - Name: `YourApp-OneDrive-Direct`
   - Supported account types: `Accounts in any organizational directory and personal Microsoft accounts`
   - Redirect URI: `http://localhost:3000` (לפיתוח)

3. **הגדר Authentication:**
   - Platform: `Single-page application (SPA)`
   - Redirect URIs: `http://localhost:3000`, `https://your-domain.com`
   - Implicit grant: `Access tokens`, `ID tokens`

4. **הוסף API Permissions:**
   - Microsoft Graph
   - Delegated permissions:
     - `Files.ReadWrite`
     - `Files.ReadWrite.All`
     - `User.Read`

5. **צור Client Secret (אופציונלי):**
   - Certificates & secrets
   - New client secret
   - העתק את הערך

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

במקום להשתמש ב-`oneDriveService.js`, השתמש ב-`oneDriveDirectService.js`:

```javascript
// במקום:
import oneDriveService from '../services/oneDriveService';

// השתמש ב:
import oneDriveDirectService from '../services/oneDriveDirectService';
```

### 4. עדכון הקומפוננטים

עדכן את הקומפוננטים שמשתמשים ב-OneDrive:

```javascript
// לפני:
const result = await oneDriveService.uploadFile(file, userEmail);

// אחרי:
const result = await oneDriveDirectService.uploadFile(file, userEmail);
```

## דוגמה מלאה לשימוש:

```javascript
import React, { useState } from 'react';
import oneDriveDirectService from '../services/oneDriveDirectService';

const OneDriveUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);

  // התחברות למשתמש
  const handleLogin = async () => {
    try {
      const userInfo = await oneDriveDirectService.getCurrentUser();
      if (!userInfo) {
        // המשתמש לא מחובר, יפתח חלון התחברות
        await oneDriveDirectService.getAccessToken();
        const newUserInfo = await oneDriveDirectService.getCurrentUser();
        setUser(newUserInfo);
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
      
      const result = await oneDriveDirectService.uploadFile(file, user?.username);
      
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
      {!user ? (
        <button onClick={handleLogin}>התחבר ל-OneDrive</button>
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

## הגדרות CORS (אם נדרש):

אם יש בעיות CORS, הוסף ל-`public/index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https://graph.microsoft.com https://login.microsoftonline.com;">
```

## בדיקת העבודה:

1. **התחברות:**
   ```
   [OneDrive Direct] Initializing MSAL...
   [OneDrive Direct] MSAL initialized successfully
   [OneDrive Direct] Getting access token directly from Azure AD...
   [OneDrive Direct] No active account, initiating login...
   [OneDrive Direct] Login successful: user@example.com
   ```

2. **העלאת קובץ:**
   ```
   [OneDrive Direct] Starting direct file upload to OneDrive
   [OneDrive Direct] Upload URL: https://graph.microsoft.com/v1.0/me/drive/root:/filename.pdf:/content
   [OneDrive Direct] File uploaded successfully
   ```

## פתרון בעיות:

### בעיה: "AADSTS700016: Application not found"
**פתרון:** בדוק שה-Client ID נכון ב-`azureAuth.js`

### בעיה: "AADSTS50011: The reply URL specified in the request does not match"
**פתרון:** הוסף את ה-URL הנכון ל-Redirect URIs ב-Azure

### בעיה: "CORS error"
**פתרון:** וודא שה-Origin מוגדר נכון ב-Azure App Registration

### בעיה: "Insufficient privileges"
**פתרון:** הוסף את ה-API Permissions הנדרשים

## מעבר מ-Proxy ל-Direct:

1. **גבה את הקוד הנוכחי**
2. **החלף את השירותים**
3. **בדוק את האותנטיקציה**
4. **בדוק את ההעלאות**
5. **מחק את קבצי השרת הישנים**

## לסיכום:

עבודה ישירה עם OneDrive היא **פשוטה יותר** ו**חסכונית יותר**, אבל דורשת **הגדרה נכונה** של Azure AD. אם אתה רוצה פתרון מהיר ללא שרת, זה הדרך! 