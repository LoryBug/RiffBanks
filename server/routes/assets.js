const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { upload, handleUploadError } = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', assetController.list);
router.post('/', upload.single('file'), handleUploadError, assetController.upload);
router.post('/text', assetController.createText);
router.post('/:id/vote', assetController.vote);
router.delete('/:id', assetController.delete);

module.exports = router;