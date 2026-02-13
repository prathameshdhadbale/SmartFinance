import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAnalytics, getDateBasedView } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAnalytics);
router.get('/date-view', getDateBasedView);

export default router;
