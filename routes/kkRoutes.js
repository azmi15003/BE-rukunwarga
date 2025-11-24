const express = require('express');
const router = express.Router();
const kkController = require('../controllers/kkController');
const { authenticateToken } = require('../middleware/authMiddleware');


console.log('kkController:', kkController);

router.get('/', kkController.getAllKK);
router.post('/', kkController.createKK)

module.exports = router;
