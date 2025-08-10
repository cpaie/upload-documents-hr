# 🚀 Quick Start Guide - PDF Upload React Application

## 📋 מה יש לך עכשיו

### 📁 קבצים חדשים שנוצרו:
1. **`manuals/PROJECT_OVERVIEW.md`** - תיעוד מלא של הפרויקט
2. **`manuals/CHAT_TEMPLATE.md`** - תבנית הודעה לצ'אט חדש
3. **`deploy.sh`** - סקריפט הפצה ל-Linux/Mac
4. **`deploy.ps1`** - סקריפט הפצה ל-Windows
5. **`quick-update.sh`** - סקריפט עדכון מהיר ל-Linux/Mac
6. **`quick-update.ps1`** - סקריפט עדכון מהיר ל-Windows
7. **`README.md`** - תיעוד מעודכן
8. **`manuals/QUICK_START.md`** - מדריך זה

## 🎯 איך להשתמש בזה

### 1. **לצ'אט חדש** - העתק את התוכן מ-`manuals/CHAT_TEMPLATE.md`

### 2. **לפיתוח מהיר** - השתמש בסקריפטים:

#### Windows (PowerShell):
```powershell
# בדיקת סטטוס
.\quick-update.ps1 status

# בדיקת build
.\quick-update.ps1 test

# הפצת frontend
.\quick-update.ps1 frontend

# הפצת backend
.\quick-update.ps1 backend

# הפצת הכל
.\quick-update.ps1 both

# התחלת development server
.\quick-update.ps1 dev
```

#### Linux/Mac:
```bash
# בדיקת סטטוס
./quick-update.sh status

# בדיקת build
./quick-update.sh test

# הפצת frontend
./quick-update.sh frontend

# הפצת backend
./quick-update.sh backend

# הפצת הכל
./quick-update.sh both

# התחלת development server
./quick-update.sh dev
```

### 3. **להפצה מלאה** - השתמש בסקריפטים המלאים:

#### Windows:
```powershell
.\deploy.ps1 both
```

#### Linux/Mac:
```bash
./deploy.sh both
```

## 🔧 זיכרון לעדכון

**חשוב לזכור:**
- ✅ **לא לבצע build לפני אישור השינויים**
- ✅ **לחכות לאישור שלך לפני commit ו-push**
- ✅ **לבדוק את הקבצים לפני הפצה**

## 📞 מידע חשוב

### URLs:
- **Frontend**: https://coruscating-puppy-056d4c.netlify.app
- **Backend**: https://pdfupload-server-181115428363.me-west1.run.app
- **Supabase**: https://jupbjbcskoetisooirza.supabase.co
- **Repository**: https://github.com/cpaie/upload-documents-hr

### Environment Variables:
```env
REACT_APP_SUPABASE_URL=https://jupbjbcskoetisooirza.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[your-anon-key]
REACT_APP_API_BASE_URL=https://pdfupload-server-181115428363.me-west1.run.app
REACT_APP_GCS_PROJECT_ID=famous-store-468216-p6
REACT_APP_GCS_BUCKET_NAME=pdf-upload-myapp
REACT_APP_WEBHOOK_URL=[your-webhook-url]
REACT_APP_WEBHOOK_API_KEY=[your-webhook-key]
```

## 📚 תיעוד מפורט

כל התיעוד המפורט נמצא בתיקיית `manuals/`:
- **`manuals/PROJECT_OVERVIEW.md`** - תיעוד מלא של הפרויקט
- **`manuals/CHAT_TEMPLATE.md`** - תבנית לצ'אט חדש
- **`manuals/README.md`** - סקירה של כל המדריכים

## 🎉 הכל מוכן!

עכשיו יש לך:
- ✅ תיעוד מלא של הפרויקט (בתיקיית `manuals/`)
- ✅ סקריפטים אוטומטיים להפצה
- ✅ תבנית לצ'אט חדש
- ✅ מדריך מהיר להתחלה

**הכל מאורגן ומוכן לשימוש!** 🚀
