const express = require('express');
const router = express.Router();
const wargaController = require('../controllers/inhabitantController');

router.get('/', wargaController.getAllWarga);
router.post('/', wargaController.createWarga);

module.exports = router;
