const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', messageController.list);
router.get('/unread-counts', messageController.getUnreadCounts);
router.post('/mark-read', messageController.markAsRead);
router.get('/unread-counts-by-song', messageController.getUnreadCountsBySong);

module.exports = router;
