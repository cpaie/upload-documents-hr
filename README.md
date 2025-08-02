# PDF Upload React App

A modern React application for uploading PDF documents with support for both Make.com webhooks and Firebase Storage. Features a beautiful, responsive UI with drag-and-drop functionality.

## Features

- 🎨 **Modern React UI**: Built with React hooks and modern JavaScript
- 📁 **Drag & Drop**: Intuitive file upload with drag and drop support
- 🔒 **File Validation**: PDF-only uploads with size limits (10MB max)
- 📊 **Progress Tracking**: Real-time upload progress with visual feedback
- 🌐 **Dual Upload Modes**: 
  - Make.com webhook integration
  - Firebase Storage & Firestore integration
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ⚡ **Fast Development**: Built with Create React App for optimal performance
- 🔥 **Firebase Features**: File storage, metadata management, download links, upload history

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase** (optional):
   - Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
   - Update `src/firebase.js` with your Firebase configuration

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

5. **Choose upload mode**:
   - **Webhook Upload**: Upload to Make.com webhooks
   - **Firebase Upload**: Upload to Firebase Storage with metadata

## Project Structure

```
pdf-upload-react/
├── public/
│   ├── index.html          # Main HTML file
│   └── manifest.json       # Web app manifest
├── src/
│   ├── components/
│   │   ├── PDFUploadForm.js        # Webhook upload component
│   │   ├── FirebaseUploadForm.js   # Firebase upload component
│   │   └── PDFUploadForm.css       # Component styles
│   ├── services/
│   │   └── firebaseService.js      # Firebase service functions
│   ├── firebase.js                 # Firebase configuration
│   ├── App.js                      # Main App component
│   ├── App.css                     # App styles
│   ├── index.js                    # React entry point
│   └── index.css                   # Global styles
├── package.json                    # Dependencies and scripts
├── README.md                       # This file
└── FIREBASE_SETUP.md              # Firebase setup guide
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Upload Modes

### 1. Webhook Upload (Original)
Uploads files directly to Make.com webhooks with the original functionality.

**Setup Instructions**:
1. Log in to your Make.com account
2. Create a new scenario with a Webhook trigger
3. Copy the webhook URL
4. Use the webhook URL in the app

### 2. Firebase Upload (New)
Uploads files to Firebase Storage and stores metadata in Firestore.

**Features**:
- ✅ File storage in Firebase Storage
- ✅ Metadata storage in Firestore
- ✅ Download links for uploaded files
- ✅ Upload history with file management
- ✅ File deletion capabilities
- ✅ Real-time progress tracking

**Setup Instructions**:
- See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed setup guide

## Usage

### Webhook Upload Mode

1. **Switch to Webhook Mode**: Use the toggle in the header
2. **Enter Webhook URL**: Paste your Make.com webhook URL
3. **Enter API Key**: Add your webhook API key
4. **Select Files**: Click or drag and drop PDF files
5. **Upload**: Click "Upload Documents" to send to webhook

### Firebase Upload Mode

1. **Switch to Firebase Mode**: Use the toggle in the header
2. **Select Files**: Click or drag and drop PDF files
3. **Upload**: Click "Upload to Firebase" to store files
4. **View History**: See all uploaded files with download/delete options

### File Requirements

- **Format**: PDF files only
- **Size**: Maximum 10MB per file
- **Quantity**: Exactly 2 files required

## Firebase Features

### File Management
- **Upload**: Files are stored in Firebase Storage with unique timestamps
- **Download**: Direct download links for all uploaded files
- **Delete**: Remove files from both Storage and Firestore
- **History**: View all uploads with metadata

### Data Storage
- **Firebase Storage**: Actual PDF files
- **Firestore**: File metadata (name, size, URL, timestamp)
- **Real-time**: Automatic updates when files are added/removed

## React Features Used

- **React Hooks**: useState, useRef, useEffect for state management
- **Functional Components**: Modern React patterns
- **Event Handling**: Form submission and file handling
- **Conditional Rendering**: Dynamic UI based on state
- **CSS Modules**: Scoped styling for components
- **Firebase SDK**: Storage and Firestore integration

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Customization

### Styling

Modify the CSS files to customize:
- `src/index.css` - Global styles
- `src/App.css` - App component styles
- `src/components/PDFUploadForm.css` - Upload form styles

### Functionality

Edit the React components to customize:
- `src/components/PDFUploadForm.js` - Webhook upload logic
- `src/components/FirebaseUploadForm.js` - Firebase upload logic
- `src/services/firebaseService.js` - Firebase service functions
- `src/App.js` - App structure and layout

## Development

### Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure Firebase (optional) - see FIREBASE_SETUP.md
4. Start development server with `npm start`
5. Open browser to `http://localhost:3000`

### Testing

- Test both upload modes
- Test with various PDF file sizes
- Test drag and drop functionality
- Test mobile responsiveness
- Test error scenarios
- Test Firebase features (if configured)

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Troubleshooting

### Common Issues

1. **CORS Error**: Ensure your webhook allows cross-origin requests
2. **File Too Large**: Reduce file size to under 10MB
3. **Invalid File Type**: Ensure files are PDF format
4. **Network Error**: Check internet connection and webhook URL
5. **Firebase Errors**: Check Firebase configuration and security rules

### Debug Mode

Open browser developer tools (F12) to see:
- Console logs for debugging
- Network requests and responses
- React component state
- Firebase SDK logs

## Security Considerations

- **File Validation**: Client-side validation prevents invalid uploads
- **Size Limits**: Prevents large file uploads
- **HTTPS**: Use HTTPS in production for secure file transfer
- **Webhook Security**: Secure your Make.com webhook URL
- **Firebase Security**: Configure proper security rules for production

## Dependencies

- **React**: 18.2.0 - UI library
- **React DOM**: 18.2.0 - DOM rendering
- **React Scripts**: 5.0.1 - Build tools
- **Firebase**: Latest - Firebase SDK for Storage and Firestore
- **Font Awesome**: 6.0.0 - Icons
- **Inter Font**: Google Fonts - Typography

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify webhook/Firebase configuration
4. Test with different files
5. Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for Firebase-specific issues

---

**Note**: This React application supports both Make.com webhook uploads and Firebase Storage uploads. Choose the mode that best fits your needs. Ensure you have proper permissions and security measures in place for your specific use case. 