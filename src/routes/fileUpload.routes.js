const express = require('express');
const fileUploadController = require('../controllers/fileUploadController');

const router = express.Router();

router.post('/upload', fileUploadController.saveFile);
router.get('/:uuid', fileUploadController.downloadLinkGeneration);
router.get('/download/:uuid', fileUploadController.downloadFile);

module.exports = router;
