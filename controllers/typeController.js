// controllers/typeController.js
const db = require('../config/database');

/**
 * @desc Create a new type
 * @route POST /api/types
 * @access Public (or Authenticated)
 */
exports.createType = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Type name is required.' });
        }

        const [result] = await db.query(
            'INSERT INTO types (name, description) VALUES (?, ?)',
            [name, description || null]
        );

        res.status(201).json({
            message: 'Type created successfully!',
            type: { id: result.insertId, name, description }
        });
    } catch (error) {
        console.error('>>> ERROR createType:', error);
        // Check for duplicate entry error if 'name' is unique
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Type with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error while creating type.' });
    }
};

/**
 * @desc Get all types
 * @route GET /api/types
 * @access Public
 */
exports.getAllTypes = async (req, res) => {
    try {
        const [types] = await db.query('SELECT * FROM types ORDER BY created_at DESC');
        res.status(200).json({ count: types.length, types });
    } catch (error) {
        console.error('>>> ERROR getAllTypes:', error);
        res.status(500).json({ message: 'Server error while fetching types.' });
    }
};

/**
 * @desc Get type by ID
 * @route GET /api/types/:id
 * @access Public
 */
exports.getTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const [type] = await db.query('SELECT * FROM types WHERE id = ?', [id]);

        if (type.length === 0) {
            return res.status(404).json({ message: 'Type not found.' });
        }

        res.status(200).json({ type: type[0] });
    } catch (error) {
        console.error('>>> ERROR getTypeById:', error);
        res.status(500).json({ message: 'Server error while fetching type.' });
    }
};

/**
 * @desc Update a type
 * @route PUT /api/types/:id
 * @access Public (or Authenticated)
 */
exports.updateType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Type name is required.' });
        }

        const [result] = await db.query(
            'UPDATE types SET name = ?, description = ? WHERE id = ?',
            [name, description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Type not found or no changes made.' });
        }

        res.status(200).json({ message: 'Type updated successfully!' });
    } catch (error) {
        console.error('>>> ERROR updateType:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Type with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error while updating type.' });
    }
};

/**
 * @desc Delete a type
 * @route DELETE /api/types/:id
 * @access Public (or Authenticated)
 */
exports.deleteType = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM types WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Type not found.' });
        }

        res.status(200).json({ message: 'Type deleted successfully!' });
    } catch (error) {
        console.error('>>> ERROR deleteType:', error);
        res.status(500).json({ message: 'Server error while deleting type.' });
    }
};