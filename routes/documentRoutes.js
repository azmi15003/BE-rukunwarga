const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const createUploader = require('../middleware/upload');
// const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware'); // Uncomment if you have auth

// Upload documents to a folder named "documents"
const uploadDocument = createUploader('documents');

// Route to create a new document with file upload
router.post('/',
    // authenticateToken, authenticateAdmin, // Uncomment if you have auth
    uploadDocument.single('documentFile'), // 'documentFile' is the field name for the file in the form
    documentController.createDocument
);

// Route to get a list of documents
router.get('/', documentController.getDocuments);

// Route to get document by ID (added for completeness)
router.get('/:id', documentController.getDocumentById);

// Route to update a document (added for completeness)
router.put('/:id',
    // authenticateToken, authenticateAdmin, // Uncomment if you have auth
    uploadDocument.single('documentFile'), // Allow updating the file too
    documentController.updateDocument
);

// Route to delete a document (added for completeness)
router.delete('/:id',
    // authenticateToken, authenticateAdmin, // Uncomment if you have auth
    documentController.deleteDocument
);

module.exports = router;