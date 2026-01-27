const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

// Download with secure token
router.get('/:token', downloadController.downloadFile);

// Verify token without downloading
router.get('/:token/verify', downloadController.verifyToken);

module.exports = router;
