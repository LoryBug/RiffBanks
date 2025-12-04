const express = require('express');
const router = express.Router();
const gigController = require('../controllers/gigController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', gigController.list);
router.get('/my-applications', gigController.myApplications);
router.get('/my-gigs', gigController.myGigs);
router.get('/notifications/new-count', gigController.getNewGigsCount);
router.post('/notifications/mark-visited', gigController.markGigBoardVisited);
router.get('/:id', gigController.get);
router.post('/', gigController.create);
router.patch('/:id', gigController.update);
router.delete('/:id', gigController.delete);

router.post('/:id/apply', gigController.apply);
router.post('/:id/withdraw', gigController.withdraw);
router.post('/:id/respond', gigController.respondToApplicant);

module.exports = router;
