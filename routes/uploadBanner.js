// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const createUploader = require('../middleware/upload');
const { uploadBannerKomplek, getBannerKomplek } = require('../controllers/uploadBanner');

const upload = createUploader('banner');

router.get('/', getBannerKomplek); 
router.post('/', upload.single('image'), uploadBannerKomplek);

module.exports = router;
