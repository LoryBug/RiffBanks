const express = require('express');
const router = express.Router();
const bandController = require('../controllers/bandController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', bandController.list);
router.post('/', bandController.create);
router.post('/join', bandController.join);
router.get('/:id', bandController.get);
router.patch('/:id', bandController.update);
router.post('/:id/leave', bandController.leave);
router.post('/:id/regenerate-code', bandController.regenerateCode);

module.exports = router;
