import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markNotificationRead);
router.post('/mark-all-read', notificationController.markAllRead);

export default router;
