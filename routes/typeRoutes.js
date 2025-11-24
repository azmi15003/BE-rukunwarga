const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');

router.post('/', typeController.createType);

// Route to get all types (added for completeness)
router.get('/', typeController.getAllTypes);

// Route to get type by ID (added for completeness)
router.get('/:id', typeController.getTypeById);

// Route to update a type (added for completeness)
router.put('/:id', typeController.updateType);

// Route to delete a type (added for completeness)
router.delete('/:id', typeController.deleteType);

module.exports = router;