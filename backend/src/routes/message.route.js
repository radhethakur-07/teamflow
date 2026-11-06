import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireWorkspaceRole } from '../middlewares/rbac.middleware.js';
import * as messageController from '../controllers/message.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticateJWT);
router.use(requireWorkspaceRole('team_member'));

router.get('/', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.post('/read', messageController.markRead);
router.get('/unread-counts', messageController.getUnreadCounts);

export default router;
