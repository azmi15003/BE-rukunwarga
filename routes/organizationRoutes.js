const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

router.post('/', organizationController.createOrganization);
router.get('/', organizationController.getOrganizations);
router.get('/:id', organizationController.getOrganizationById);

module.exports = router;
