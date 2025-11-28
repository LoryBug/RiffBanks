const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

router.get('/', songController.list);
router.get('/:id', songController.get);
router.delete('/:id', songController.delete);

module.exports = router;