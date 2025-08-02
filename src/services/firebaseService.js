import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { storage, db } from '../firebase';
import { storageConfig, firestoreConfig } from '../config/firebase.config';

// Upload file to Firebase Storage
export const uploadFileToStorage = async (file, folder = storageConfig.uploadFolder) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      fileName,
      downloadURL,
      size: file.size,
      type: file.type,
      timestamp
    };
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

// Store file metadata in Firestore
export const storeFileMetadata = async (fileData, additionalData = {}) => {
  try {
    const docRef = await addDoc(collection(db, firestoreConfig.uploadsCollection), {
      ...fileData,
      ...additionalData,
      createdAt: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...fileData,
      ...additionalData
    };
  } catch (error) {
    console.error('Error storing file metadata in Firestore:', error);
    throw error;
  }
};

// Get all uploads from Firestore
export const getUploads = async (limitCount = firestoreConfig.maxUploads) => {
  try {
    const q = query(
      collection(db, firestoreConfig.uploadsCollection), 
      orderBy(firestoreConfig.orderBy, firestoreConfig.orderDirection), 
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const uploads = [];
    
    querySnapshot.forEach((doc) => {
      uploads.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return uploads;
  } catch (error) {
    console.error('Error getting uploads from Firestore:', error);
    throw error;
  }
};

// Delete file from both Storage and Firestore
export const deleteFile = async (fileName, docId) => {
  try {
    // Delete from Storage
    const storageRef = ref(storage, `${storageConfig.uploadFolder}/${fileName}`);
    await deleteObject(storageRef);
    
    // Delete from Firestore
    if (docId) {
      await deleteDoc(doc(db, firestoreConfig.uploadsCollection, docId));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Upload multiple files and store metadata
export const uploadMultipleFiles = async (files, additionalData = {}) => {
  try {
    const uploadPromises = files.map(file => uploadFileToStorage(file));
    const uploadResults = await Promise.all(uploadPromises);
    
    const metadataPromises = uploadResults.map(fileData => 
      storeFileMetadata(fileData, additionalData)
    );
    
    const metadataResults = await Promise.all(metadataPromises);
    
    return metadataResults;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}; 