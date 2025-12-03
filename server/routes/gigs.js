const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gigController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Gig routes
router.get('/', gigController.list);
router.get('/my-gigs', gigController.myGigs);
router.get('/notifications/new-count', gigController.getNewGigsCount);
router.post('/notifications/mark-visited', gigController.markGigBoardVisited);
router.get('/:id', gigController.get);
router.post('/', gigController.create);
router.patch('/:id', gigController.update);
router.delete('/:id', gigController.delete);

// Application routes
router.post('/:id/apply', gigController.apply);
router.post('/:id/withdraw', gigController.withdraw);
router.post('/:id/respond', gigController.respondToApplicant);

module.exports = router;
