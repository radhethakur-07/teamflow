import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updatePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
router.get('/me', authenticateJWT, authController.getMe);
router.put('/password', authenticateJWT, validateRequest(updatePasswordSchema), authController.updatePassword);

export default router;
