const express = require('express');
const router = express.Router();
const controller = require('../controllers/informationController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');
const createUploader = require('../middleware/upload');

// Upload image ke folder "information"
const upload = createUploader('information');

// Routes
router.get('/', controller.getAllInformation);
router.get('/:id', controller.getInformationById);
router.post('/', authenticateToken, authenticateAdmin, controller.createInformation);
router.put('/:id', authenticateToken, authenticateAdmin, upload.single('image'), controller.updateInformation);
router.delete('/:id', authenticateToken, authenticateAdmin, controller.deleteInformation);

module.exports = router;
