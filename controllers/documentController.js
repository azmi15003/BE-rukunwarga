// controllers/documentController.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

/**
 * @desc Create a new document with file upload
 * @route POST /api/documents
 * @access Public (or Authenticated)
 */
exports.createDocument = async (req, res) => {
    try {
        console.log('>>> REQ.BODY (Document):', req.body);
        console.log('>>> REQ.FILE (Document):', req.file);

        const { title, content, typeId } = req.body;

        if (!title || !content || !typeId) {
            // If essential fields are missing, delete the uploaded file if it exists
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: 'Title, content, and type ID are required.' });
        }

        // Validate if typeId exists
        const [typeCheck] = await db.query('SELECT id FROM types WHERE id = ?', [typeId]);
        if (typeCheck.length === 0) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: 'Invalid typeId provided.' });
        }

        const filePath = req.file ? `/uploads/documents/${req.file.filename}` : null;

        const [result] = await db.query(
            `INSERT INTO documents (title, content, type_id, file_path)
             VALUES (?, ?, ?, ?)`,
            [title, content, typeId, filePath]
        );

        res.status(201).json({
            message: 'Document created successfully!',
            document: { id: result.insertId, title, content, typeId, filePath }
        });
    } catch (error) {
        console.error('>>> ERROR createDocument:', error);
        // If an error occurs, delete the uploaded file
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error while creating document.' });
    }
};

/**
 * @desc Get a list of all documents with pagination and type filter
 * @route GET /api/documents
 * @access Public
 */
exports.getDocuments = async (req, res) => {
    try {
        const { typeId, page = 1, limit = 10 } = req.query;

        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        const offset = (pageInt - 1) * limitInt;

        let baseQuery = 'SELECT d.*, t.name as type_name FROM documents d JOIN types t ON d.type_id = t.id';
        let countQuery = 'SELECT COUNT(*) as total FROM documents';
        const params = [];

        if (typeId && typeId !== '') {
            baseQuery += ' WHERE d.type_id = ?';
            countQuery += ' WHERE type_id = ?';
            params.push(typeId);
        }

        baseQuery += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
        const queryParams = [...params, limitInt, offset];

        const [data] = await db.query(baseQuery, queryParams);
        const [countResult] = await db.query(countQuery, params);

        const totalData = countResult[0].total;
        const totalPages = Math.ceil(totalData / limitInt);

        res.json({
            data,
            pagination: {
                totalData,
                totalPages,
                currentPage: pageInt,
                limit: limitInt,
            },
        });

    } catch (error) {
        console.error('>>> ERROR getDocuments:', error);
        res.status(500).json({ message: 'Server error while fetching documents.' });
    }
};

/**
 * @desc Get document by ID
 * @route GET /api/documents/:id
 * @access Public
 */
exports.getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [document] = await db.query(
            'SELECT d.*, t.name as type_name FROM documents d JOIN types t ON d.type_id = t.id WHERE d.id = ?',
            [id]
        );

        if (document.length === 0) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        res.status(200).json({ document: document[0] });
    } catch (error) {
        console.error('>>> ERROR getDocumentById:', error);
        res.status(500).json({ message: 'Server error while fetching document.' });
    }
};

/**
 * @desc Update a document with optional file replacement
 * @route PUT /api/documents/:id
 * @access Public (or Authenticated)
 */
exports.updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, typeId } = req.body;
        const newFilePath = req.file ? `/uploads/documents/${req.file.filename}` : null;

        // Check if the document exists
        const [existingDocument] = await db.query('SELECT file_path FROM documents WHERE id = ?', [id]);
        if (existingDocument.length === 0) {
            if (newFilePath) fs.unlinkSync(req.file.path); // Delete newly uploaded file if document not found
            return res.status(404).json({ message: 'Document not found.' });
        }

        const oldFilePath = existingDocument[0].file_path;

        let query = `
            UPDATE documents
            SET title = ?, content = ?, type_id = ?
        `;
        const params = [title, content, typeId];

        if (newFilePath) {
            query += ', file_path = ?';
            params.push(newFilePath);

            // Delete the old file if it exists and a new one is uploaded
            if (oldFilePath) {
                const fullOldPath = path.join(__dirname, '..', oldFilePath);
                if (fs.existsSync(fullOldPath)) {
                    fs.unlink(fullOldPath, (err) => {
                        if (err) console.error('Failed to delete old document file:', err);
                    });
                }
            }
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            if (newFilePath) fs.unlinkSync(req.file.path); // Delete new file if update didn't happen
            return res.status(400).json({ message: 'No changes made or document not found.' });
        }

        res.status(200).json({ message: 'Document updated successfully!' });
    } catch (error) {
        console.error('>>> ERROR updateDocument:', error);
        if (req.file) { // Delete the new file if an error occurred during update
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error while updating document.' });
    }
};

/**
 * @desc Delete a document and its associated file
 * @route DELETE /api/documents/:id
 * @access Public (or Authenticated)
 */
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // Get the file path before deleting the document record
        const [documentToDelete] = await db.query('SELECT file_path FROM documents WHERE id = ?', [id]);

        if (documentToDelete.length === 0) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        const filePath = documentToDelete[0].file_path;

        // Delete the document record from the database
        const [result] = await db.query('DELETE FROM documents WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Document not found or already deleted.' });
        }

        // Delete the associated file from the server
        if (filePath) {
            const fullPath = path.join(__dirname, '..', filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlink(fullPath, (err) => {
                    if (err) console.error('Failed to delete document file:', err);
                });
            }
        }

        res.status(200).json({ message: 'Document deleted successfully!' });
    } catch (error) {
        console.error('>>> ERROR deleteDocument:', error);
        res.status(500).json({ message: 'Server error while deleting document.' });
    }
};