import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyLoginOtpSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  updateProfileSchema,
  updatePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

// Specialized Rate Limiters for Security
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts per 15m
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10, // 10 attempts per 10m
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'OTP_RATE_LIMIT_EXCEEDED',
      message: 'Too many OTP verification requests. Please try again in a few minutes.',
    },
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset requests. Please wait 15 minutes before trying again.',
    },
  },
});

// Authentication Lifecycle Endpoints
router.post('/register', authRateLimiter, validateRequest(registerSchema), authController.register);
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', otpRateLimiter, validateRequest(resendVerificationSchema), authController.resendVerification);
router.post('/login', authRateLimiter, validateRequest(loginSchema), authController.login);
router.post('/login/otp', otpRateLimiter, validateRequest(verifyLoginOtpSchema), authController.verifyLoginOtp);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', authenticateJWT, authController.logoutAll);
router.post('/forgot-password', passwordResetLimiter, validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateRequest(resetPasswordSchema), authController.resetPassword);

// Profile & Account Management
router.get('/me', authenticateJWT, authController.getMe);
router.put('/me', authenticateJWT, validateRequest(updateProfileSchema), authController.updateMe);
router.put('/password', authenticateJWT, validateRequest(updatePasswordSchema), authController.updatePassword);

export default router;
