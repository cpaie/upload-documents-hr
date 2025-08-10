// Documents Service
// Handles API calls for fetching documents by SessionId from Supabase

import { supabase } from '../components/SubabaseClient.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const documentsService = {
  /**
   * Fetch documents by SessionId from Supabase
   * @param {string} sessionId - The session ID to fetch documents for
   * @returns {Promise<Array>} Array of documents
   */
  async fetchDocumentsBySessionId(sessionId) {
    console.log('[DocumentsService] Fetching documents from Supabase for SessionId:', sessionId);
    
    try {
      // Fetch data from both tables in Supabase
      const [idData, certData] = await Promise.all([
        // Fetch ID documents from table_id
        supabase
          .from('table_id')
          .select('*')
          .eq('SessionId', sessionId),
        
        // Fetch certificate documents from HR_cert_id
        supabase
          .from('HR_cert_id')
          .select('*')
          .eq('SessionId', sessionId)
      ]);
      
      console.log('[DocumentsService] Supabase ID data:', idData);
      console.log('[DocumentsService] Supabase certificate data:', certData);
      
      if (idData.error) {
        throw new Error(`Error fetching ID documents: ${idData.error.message}`);
      }
      
      if (certData.error) {
        throw new Error(`Error fetching certificate documents: ${certData.error.message}`);
      }
      
      // Convert Supabase data to document format
      const documents = [];
      
      // Add ID documents
      if (idData.data && idData.data.length > 0) {
        idData.data.forEach((record, index) => {
          documents.push({
            id: record.id || `id-${index}`,
            type: 'ID Document',
            documentType: 'תעודת זהות',
            fileName: `id_document_${index + 1}.pdf`,
            uploadDate: record.created_at || new Date().toISOString(),
            status: 'processed',
            fileSize: '1.2 MB',
            extractedData: {
              LastName: record.LastName || '',
              FirstName: record.FirstName || '',
              DateOfBirth: record.DateOfBirth || '',
              IdNumber: record.IdNumber || '',
              IssuedDate: record.IssuedDate || '',
              ValidUntil: record.ValidUntil || '',
              Role: record.Role || '',
              IdType: record.IdType || 'mainId'
            }
          });
        });
      }
      
      // Add certificate documents
      if (certData.data && certData.data.length > 0) {
        certData.data.forEach((record, index) => {
          documents.push({
            id: record.id || `cert-${index}`,
            type: 'Certificate Document',
            documentType: 'תעודת חברה',
            fileName: `certificate_${index + 1}.pdf`,
            uploadDate: record.created_at || new Date().toISOString(),
            status: 'processed',
            fileSize: '2.1 MB',
            extractedData: {
              CompanyNameHeb: record.CompanyNameHeb || '',
              BusinessId: record.BusinessId || '',
              IssuedDate: record.IssuedDate || '',
              cert_type: record.cert_type || ''
            }
          });
        });
      }
      
      console.log('[DocumentsService] Converted documents:', documents);
      
      return {
        sessionId: sessionId,
        documents: documents,
        summary: {
          totalDocuments: documents.length,
          idDocuments: idData.data ? idData.data.length : 0,
          certificateDocuments: certData.data ? certData.data.length : 0,
          processedDate: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('[DocumentsService] Error fetching documents from Supabase:', error);
      throw error;
    }
  },

  /**
   * Fetch document details by document ID
   * @param {string} documentId - The document ID to fetch details for
   * @returns {Promise<Object>} Document details
   */
  async fetchDocumentDetails(documentId) {
    console.log('[DocumentsService] Fetching document details for ID:', documentId);
    
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/documents/details/${documentId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      }
      
      // Mock document details
      return {
        id: documentId,
        fileName: `document_${documentId}.pdf`,
        fileSize: '2.5 MB',
        uploadDate: new Date().toISOString(),
        status: 'processed',
        extractedData: {
          confidence: 0.95,
          fields: ['name', 'date', 'number']
        }
      };
    } catch (error) {
      console.error('[DocumentsService] Error fetching document details:', error);
      throw error;
    }
  },

  /**
   * Download document by document ID
   * @param {string} documentId - The document ID to download
   * @returns {Promise<Blob>} Document file blob
   */
  async downloadDocument(documentId) {
    console.log('[DocumentsService] Downloading document:', documentId);
    
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/api/documents/download/${documentId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.blob();
      }
      
      // Mock download - create a dummy PDF blob
      const dummyContent = `Mock PDF content for document ${documentId}`;
      return new Blob([dummyContent], { type: 'application/pdf' });
    } catch (error) {
      console.error('[DocumentsService] Error downloading document:', error);
      throw error;
    }
  },

  /**
   * Get document download URL
   * @param {string} documentId - The document ID
   * @returns {string} Download URL
   */
  getDocumentDownloadUrl(documentId) {
    if (API_BASE_URL) {
      return `${API_BASE_URL}/api/documents/download/${documentId}`;
    }
    return null;
  },


};

export default documentsService; 