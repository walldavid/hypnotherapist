const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

// Get download information (validates token, returns product info)
router.get('/:token', downloadController.getDownloadInfo);

// Download a specific file
router.post('/:token/file', downloadController.downloadFile);

module.exports = router;
