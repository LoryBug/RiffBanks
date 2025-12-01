const express = require('express');
const router = express.Router();
const bandController = require('../controllers/bandController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', bandController.list);
router.post('/', bandController.create);
router.post('/join', bandController.join);
router.get('/:id', bandController.get);

module.exports = router;
