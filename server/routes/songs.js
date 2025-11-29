const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', songController.list);
router.post('/', songController.create);
router.get('/:id', songController.get);
router.patch('/:id', songController.update);
router.delete('/:id', songController.delete);

module.exports = router;