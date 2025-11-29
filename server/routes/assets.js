const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { upload, handleUploadError } = require('../middleware/upload');

router.get('/', assetController.list);
router.post('/', upload.single('file'), handleUploadError, assetController.upload);
router.post('/:id/vote', assetController.vote);
router.delete('/:id', assetController.delete);

module.exports = router;