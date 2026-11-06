import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
    otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit numeric code').optional(),
  }),
});

export const verifyLoginOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit numeric code'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    otp: z.string().regex(/^\d{6}$/, 'Verification code must be a 6-digit code'),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    otp: z.string().regex(/^\d{6}$/, 'Recovery code must be a 6-digit code'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    jobTitle: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    preferences: z
      .object({
        emailTaskAssigned: z.boolean().optional(),
        emailComments: z.boolean().optional(),
        emailDueSoon: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
        theme: z.string().optional(),
      })
      .optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});
