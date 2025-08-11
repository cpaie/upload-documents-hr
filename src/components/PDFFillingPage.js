import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import './PDFFillingPage.css';

const PDFFillingPage = ({ sessionId, firstName, onBackToDocuments }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // PDF template file name
  const PDF_TEMPLATE_NAME = 'B7 - workers-rights_contractors-and-private-bureaus_commitment1.pdf';

  // Function to get safe text for PDF (handle Hebrew properly)
  const getSafeTextForPDF = (text) => {
    if (!text) return 'Name';
    
    // For now, transliterate Hebrew to English to avoid encoding issues
    // In production, you would use a proper Hebrew font
    const hebrewToEnglish = {
      'א': 'A', 'ב': 'B', 'ג': 'G', 'ד': 'D', 'ה': 'H', 'ו': 'V', 'ז': 'Z', 'ח': 'Ch', 'ט': 'T',
      'י': 'Y', 'כ': 'K', 'ל': 'L', 'מ': 'M', 'נ': 'N', 'ס': 'S', 'ע': 'A', 'פ': 'P', 'צ': 'Tz',
      'ק': 'K', 'ר': 'R', 'ש': 'Sh', 'ת': 'T',
      'ם': 'M', 'ן': 'N', 'ץ': 'Tz', 'ף': 'F', 'ץ': 'Tz'
    };
    
    // Check if text contains Hebrew characters
    const hasHebrew = /[\u0590-\u05FF]/.test(text);
    
    if (hasHebrew) {
      // Transliterate Hebrew to English
      let transliterated = '';
      for (let char of text) {
        if (hebrewToEnglish[char]) {
          transliterated += hebrewToEnglish[char];
        } else if (/[a-zA-Z0-9\s]/.test(char)) {
          transliterated += char;
        }
      }
      return transliterated.trim() || 'Name';
    }
    
    // If no Hebrew, return as is
    return text;
  };

  // Function to create PDF with proper font handling
  const createPDFWithFont = async (pdfDoc) => {
    // For now, don't specify font and let PDF library use default
    return {
      font: undefined, // Let PDF library use default font
      supportsHebrew: false
    };
  };

  useEffect(() => {
    // Load the PDF template when component mounts
    loadPDFTemplate();
  }, []);

  const loadPDFTemplate = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // For now, always create a sample PDF since we don't have the actual template
      // In production, you would fetch the real PDF template here
      await createSamplePDF();
      
    } catch (err) {
      console.error('Error creating sample PDF:', err);
      setError('Failed to create PDF template. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createSamplePDF = async () => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      
      // Add some sample content
      const { width, height } = page.getSize();
      
      // Setup font and text content
      const fontConfig = await createPDFWithFont(pdfDoc);
      
      // Define text content (using English for now)
      const titleText = 'B7 - Workers Rights Contractors and Private Bureaus Commitment';
      const subtitleText = 'Commitment Form for Workers Rights';
      const firstNameLabel = 'First Name:';
      const lastNameLabel = 'Last Name:';
      const dateLabel = 'Date:';
      const sampleText = 'I hereby commit to comply with all workers rights regulations...';
      
      // Add title
      page.drawText(titleText, {
        x: 50,
        y: height - 100,
        size: 16,
        color: rgb(0, 0, 0),
      });
      
      // Add subtitle
      page.drawText(subtitleText, {
        x: 50,
        y: height - 130,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      // Add form fields
      const form = pdfDoc.getForm();
      
      // Create a text field for First Name
      const firstNameField = form.createTextField('firstName');
      const safeFirstName = getSafeTextForPDF(firstName);
      firstNameField.setText(safeFirstName);
      firstNameField.addToPage(page, { 
        x: 100, 
        y: height - 200, 
        width: 200, 
        height: 20 
      });
      
      // Add label for the field
      page.drawText(firstNameLabel, {
        x: 50,
        y: height - 190,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      // Add more form fields for demonstration
      page.drawText(lastNameLabel, {
        x: 50,
        y: height - 250,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      const lastNameField = form.createTextField('lastName');
      lastNameField.setText('');
      lastNameField.addToPage(page, { 
        x: 100, 
        y: height - 260, 
        width: 200, 
        height: 20 
      });
      
      page.drawText(dateLabel, {
        x: 50,
        y: height - 300,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      const dateField = form.createTextField('date');
      dateField.setText(new Date().toLocaleDateString('he-IL'));
      dateField.addToPage(page, { 
        x: 100, 
        y: height - 310, 
        width: 200, 
        height: 20 
      });
      
      // Add some sample text
      page.drawText(sampleText, {
        x: 50,
        y: height - 400,
        size: 10,
        color: rgb(0, 0, 0),
      });
      
      // Add note about Hebrew support
      page.drawText('Note: Hebrew names are transliterated to English in this form', {
        x: 50,
        y: height - 450,
        size: 8,
        color: rgb(0.6, 0.6, 0.6),
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      setPdfFile(pdfBytes);
      
    } catch (err) {
      console.error('Error creating sample PDF:', err);
      setError('Failed to create sample PDF. Please try again.');
    }
  };

  const fillPDFWithData = async () => {
    if (!pdfFile) {
      setError('PDF template not loaded');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Since we're working with a newly created PDF, we can directly use it
      // The PDF already has the firstName field filled in from createSamplePDF
      
      // Create download link
      const blob = new Blob([pdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `filled_${PDF_TEMPLATE_NAME}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      setSuccess(true);
      
    } catch (err) {
      console.error('Error filling PDF:', err);
      setError('Failed to fill PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToDocuments = () => {
    onBackToDocuments();
  };

  if (isProcessing && !pdfFile) {
    return (
      <div className="pdf-filling-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען תבנית PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-filling-page">
      <div className="pdf-header">
        <button className="back-btn" onClick={handleBackToDocuments}>
          ← חזור למסמכים
        </button>
        <h2>מילוי טופס התחייבות</h2>
        <div className="session-info">
          <span className="session-label">Session ID:</span>
          <span className="session-id">{sessionId}</span>
        </div>
      </div>

      <div className="pdf-content">
        <div className="pdf-info-card">
          <h3>פרטי המסמך</h3>
          <div className="pdf-details">
            <div className="detail-row">
              <span className="detail-label">שם הקובץ:</span>
              <span className="detail-value">{PDF_TEMPLATE_NAME}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">שם פרטי:</span>
              <span className="detail-value">{firstName || 'לא זמין'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">שם באנגלית:</span>
              <span className="detail-value">{getSafeTextForPDF(firstName)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">סטטוס:</span>
              <span className="detail-value">
                {success ? '✅ הושלם בהצלחה' : '⏳ ממתין להורדה'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">הערה:</span>
              <span className="detail-value">תבנית PDF באנגלית (תמיכה בעברית תתווסף בהמשך)</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>שגיאה: {error}</p>
            <button onClick={loadPDFTemplate} className="retry-btn">
              נסה שוב
            </button>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>✅ הקובץ הורד בהצלחה!</p>
            <p>הקובץ המלא נשמר במחשב שלך.</p>
          </div>
        )}

        <div className="pdf-actions">
          <button 
            className="fill-pdf-btn"
            onClick={fillPDFWithData}
            disabled={isProcessing || !pdfFile || success}
          >
            {isProcessing ? '⏳ מוריד PDF...' : '📥 הורד PDF עם הנתונים'}
          </button>
          
          {success && (
            <button 
              className="fill-again-btn"
              onClick={() => {
                setSuccess(false);
                fillPDFWithData();
              }}
            >
              📥 הורד שוב
            </button>
          )}
        </div>

        <div className="pdf-instructions">
          <h4>הוראות:</h4>
          <ul>
            <li>לחץ על "הורד PDF עם הנתונים" כדי להוריד את הטופס המלא</li>
            <li>הקובץ יורד אוטומטית למחשב שלך עם השם הפרטי מלא</li>
            <li>אם יש בעיה, לחץ על "נסה שוב"</li>
            <li>הקובץ כולל תבנית התחייבות לדוגמה עם השדות הנדרשים</li>
            <li>הערה: שמות בעברית מתורגמים לאנגלית בטופס (לדוגמה: משה → MSH)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFFillingPage; 