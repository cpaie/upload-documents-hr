# PDF Upload React App

A modern React application for uploading PDF documents to a Make.com webhook with a beautiful, responsive UI.

## Features

- 🎨 **Modern React UI**: Built with React hooks and modern JavaScript
- 📁 **Drag & Drop**: Intuitive file upload with drag and drop support
- 🔒 **File Validation**: PDF-only uploads with size limits (10MB max)
- 📊 **Progress Tracking**: Real-time upload progress with visual feedback
- 🌐 **Webhook Integration**: Direct upload to Make.com webhooks
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ⚡ **Fast Development**: Built with Create React App for optimal performance

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

4. **Enter** your Make.com webhook URL and upload PDF documents

## Project Structure

```
pdf-upload-react/
├── public/
│   ├── index.html          # Main HTML file
│   └── manifest.json       # Web app manifest
├── src/
│   ├── components/
│   │   ├── PDFUploadForm.js    # Main upload component
│   │   └── PDFUploadForm.css   # Component styles
│   ├── App.js              # Main App component
│   ├── App.css             # App styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Setup Instructions

### 1. Make.com Webhook Setup

1. Log in to your Make.com account
2. Create a new scenario
3. Add a **Webhook** trigger module
4. Copy the webhook URL provided
5. Configure the webhook to handle file uploads

### 2. Webhook Configuration

Your Make.com webhook should be configured to receive:
- `pdf1`: First PDF file
- `pdf2`: Second PDF file
- `timestamp`: Upload timestamp
- `totalFiles`: Number of files (always 2)

### 3. CORS Configuration

If you encounter CORS issues, ensure your Make.com webhook allows:
- **Origin**: Your domain or `*` for testing
- **Methods**: POST
- **Headers**: Content-Type

## Usage

### Basic Upload

1. **Enter Webhook URL**: Paste your Make.com webhook URL in the input field
2. **Select Files**: Click on each upload area or drag and drop PDF files
3. **Review**: Check file names and sizes are correct
4. **Upload**: Click "Upload Documents" to send files to your webhook

### File Requirements

- **Format**: PDF files only
- **Size**: Maximum 10MB per file
- **Quantity**: Exactly 2 files required

### Upload Process

1. **Validation**: Files are validated for type and size
2. **Progress**: Real-time progress bar shows upload status
3. **Completion**: Success/error message displayed
4. **Reset**: Form automatically resets after successful upload

## React Features Used

- **React Hooks**: useState, useRef for state management
- **Functional Components**: Modern React patterns
- **Event Handling**: Form submission and file handling
- **Conditional Rendering**: Dynamic UI based on state
- **CSS Modules**: Scoped styling for components

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
- `src/components/PDFUploadForm.js` - Main upload logic
- `src/App.js` - App structure and layout

### Webhook Data

The application sends the following data to your webhook:

```json
{
  "pdf1": "[File object]",
  "pdf2": "[File object]",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "totalFiles": "2"
}
```

## Development

### Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Start development server with `npm start`
4. Open browser to `http://localhost:3000`

### Testing

- Test with various PDF file sizes
- Test drag and drop functionality
- Test mobile responsiveness
- Test error scenarios

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

### Debug Mode

Open browser developer tools (F12) to see:
- Console logs for debugging
- Network requests and responses
- React component state

## Security Considerations

- **File Validation**: Client-side validation prevents invalid uploads
- **Size Limits**: Prevents large file uploads
- **HTTPS**: Use HTTPS in production for secure file transfer
- **Webhook Security**: Secure your Make.com webhook URL

## Dependencies

- **React**: 18.2.0 - UI library
- **React DOM**: 18.2.0 - DOM rendering
- **React Scripts**: 5.0.1 - Build tools
- **Font Awesome**: 6.0.0 - Icons
- **Inter Font**: Google Fonts - Typography

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify webhook configuration
4. Test with different files

---

**Note**: This React application is designed for uploading PDF files to Make.com webhooks. Ensure you have proper permissions and security measures in place for your specific use case. 