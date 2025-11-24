const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authenticateToken, authenticateAdmin } = require('../middleware/authMiddleware');
const createUploader = require('../middleware/upload');
const uploadNews = createUploader('news');

router.get('/', newsController.getAllNews);
router.put('/:id', authenticateToken, authenticateAdmin, uploadNews.single('image'), newsController.updateNews);
router.delete('/:id', authenticateToken, authenticateAdmin, newsController.deleteNews);
router.post(
  '/',
  authenticateToken,
  authenticateAdmin,
  uploadNews.single('image'),
  newsController.createNews
);

router.post(
  '/upload-image',
  authenticateToken,
  authenticateAdmin,
  uploadNews.single('image'),
  newsController.uploadImage
);

module.exports = router;
