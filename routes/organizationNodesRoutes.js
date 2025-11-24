const express = require('express');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');
const createUploader = require('../middleware/upload');

const router = express.Router();
const organizationNodesController = require('../controllers/organizationNodesController');
const upload = createUploader('organization');

router.post(
  '/upload-image',
  authenticateToken,
  authenticateAdmin,
  upload.single('image'),
  organizationNodesController.uploadImage
);
router.post('/', organizationNodesController.createOrganizationTree);
router.get('/', organizationNodesController.getOrganizationTree);

module.exports = router;
