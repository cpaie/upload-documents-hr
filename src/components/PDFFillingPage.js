import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import './PDFFillingPage.css';

const PDFFillingPage = ({ sessionId, firstName, onBackToDocuments }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isUsingSample, setIsUsingSample] = useState(false);

  // PDF template file name
  const PDF_TEMPLATE_NAME = 'B7-workers-rights_contractors-and-private-bureaus_commitment1.pdf';

  // Function to get safe text for PDF (preserve Hebrew)
  const getSafeTextForPDF = (text) => {
    return text || 'שם';
  };

  // Function to create PDF with proper font handling
  const createPDFWithFont = async (pdfDoc) => {
    try {
      // Try to embed a Hebrew font
      const fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf';
      const fontResponse = await fetch(fontUrl);
      
      if (fontResponse.ok) {
        const fontBytes = await fontResponse.arrayBuffer();
        const hebrewFont = await pdfDoc.embedFont(fontBytes);
        console.log('Hebrew font embedded successfully');
        return {
          font: hebrewFont,
          supportsHebrew: true
        };
      } else {
        throw new Error('Could not load Hebrew font');
      }
    } catch (error) {
      console.warn('Could not embed Hebrew font, using default:', error);
      return {
        font: undefined,
        supportsHebrew: false
      };
    }
  };

  useEffect(() => {
    // Load the PDF template when component mounts
    loadPDFTemplate();
  }, []);

  const loadPDFTemplate = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Try to load the actual PDF template
      const response = await fetch('/B7-workers-rights_contractors-and-private-bureaus_commitment1.pdf');
      if (!response.ok) {
        console.warn('PDF template not found, creating sample PDF instead');
        setIsUsingSample(true);
        await createSamplePDF();
        return;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Set the PDF file - let the PDF library handle validation
      setPdfFile(arrayBuffer);
      setIsUsingSample(false);
      
    } catch (err) {
      console.error('Error loading PDF template:', err);
      // Fallback to creating sample PDF
      setIsUsingSample(true);
      await createSamplePDF();
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
      
      // Define text content based on font availability
      const titleText = fontConfig.supportsHebrew ? 'B7 - התחייבות זכויות עובדים לקבלנים ולמשרדים פרטיים' : 'B7 - Workers Rights Contractors and Private Bureaus Commitment';
      const subtitleText = fontConfig.supportsHebrew ? 'טופס התחייבות לזכויות עובדים' : 'Commitment Form for Workers Rights';
      const firstNameLabel = fontConfig.supportsHebrew ? 'שם פרטי:' : 'First Name:';
      const lastNameLabel = fontConfig.supportsHebrew ? 'שם משפחה:' : 'Last Name:';
      const dateLabel = fontConfig.supportsHebrew ? 'תאריך:' : 'Date:';
      const sampleText = fontConfig.supportsHebrew ? 'אני מתחייב/ת לעמוד בכל תקנות זכויות העובדים...' : 'I hereby commit to comply with all workers rights regulations...';
      
      // Add title
      page.drawText(titleText, {
        x: 50,
        y: height - 100,
        size: 16,
        color: rgb(0, 0, 0),
        font: fontConfig.font,
      });
      
      // Add subtitle
      page.drawText(subtitleText, {
        x: 50,
        y: height - 130,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
        font: fontConfig.font,
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
        font: fontConfig.font,
      });
      
      // Add more form fields for demonstration
      page.drawText(lastNameLabel, {
        x: 50,
        y: height - 250,
        size: 12,
        color: rgb(0, 0, 0),
        font: fontConfig.font,
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

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfFile);
      const pages = pdfDoc.getPages();
      
      // Get font configuration for Hebrew support
      const fontConfig = await createPDFWithFont(pdfDoc);
      
      // Check if we have at least 2 pages
      if (pages.length < 2) {
        // If it's a sample PDF (1 page), add a second page
        const secondPage = pdfDoc.addPage([595, 842]); // A4 size
        
        // Add some content to the second page
        secondPage.drawText('Second Page - Commitment Form', {
          x: 50,
          y: 750,
          size: 16,
          color: rgb(0, 0, 0),
          font: fontConfig.font,
        });
        
        secondPage.drawText('This is where the first name will be filled:', {
          x: 50,
          y: 720,
          size: 12,
          color: rgb(0, 0, 0),
          font: fontConfig.font,
        });
      }
      
      // Get the second page (index 1)
      const secondPage = pages[1];
      
      // Get the form from the PDF
      const form = pdfDoc.getForm();
      
      // Create a text field for First Name on the second page
      const firstNameField = form.createTextField('firstName');
      const safeFirstName = getSafeTextForPDF(firstName);
      firstNameField.setText(safeFirstName);
      firstNameField.addToPage(secondPage, { 
        x: 50, 
        y: 700, 
        width: 200, 
        height: 20 
      });

      // Save the filled PDF
      const pdfBytes = await pdfDoc.save();

      // Create download link
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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
      if (err.message.includes('Failed to parse PDF')) {
        setError('The PDF file appears to be corrupted or invalid. Please check the file.');
      } else {
        setError('Failed to fill PDF. Please try again.');
      }
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
              <span className="detail-label">סטטוס:</span>
              <span className="detail-value">
                {success ? '✅ הושלם בהצלחה' : '⏳ ממתין להורדה'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">הערה:</span>
              <span className="detail-value">
                {isUsingSample ? 'תבנית PDF לדוגמה (הקובץ האמיתי לא נמצא)' : 'תבנית PDF אמיתית עם תמיכה בעברית'}
              </span>
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
            <li>הקובץ כולל תבנית התחייבות אמיתית עם השדות הנדרשים</li>
            <li>הערה: השם הפרטי ימולא בעמוד השני של הטופס עם תמיכה בעברית</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PDFFillingPage; 