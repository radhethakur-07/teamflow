import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';

/**
 * Calculates SHA-256 hash of a raw token string for secure database indexing
 * @param {string} token 
 * @returns {string} Hex encoded hash
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generates an Access Token and a Refresh Token with optional family lineage
 * @param {Object} user 
 * @param {string} [familyId] UUID session lineage identifier
 * @returns {{ accessToken: string, refreshToken: string, familyId: string, tokenId: string }}
 */
export const generateTokens = (user, familyId = null) => {
  const activeFamilyId = familyId || crypto.randomUUID();
  const tokenId = crypto.randomUUID();

  const accessPayload = {
    userId: user._id ? user._id.toString() : user.id,
    email: user.email,
  };

  const refreshPayload = {
    userId: user._id ? user._id.toString() : user.id,
    familyId: activeFamilyId,
    tokenId,
  };

  const accessToken = jwt.sign(accessPayload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry || '15m',
  });

  const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry || '7d',
  });

  return {
    accessToken,
    refreshToken,
    familyId: activeFamilyId,
    tokenId,
  };
};

/**
 * Verifies access token signature and expiration
 * @param {string} token 
 * @returns {Object|null}
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Verifies refresh token signature and expiration
 * @param {string} token 
 * @returns {Object|null}
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Standard cookie configuration for HttpOnly refresh tokens
 * @returns {import('express').CookieOptions}
 */
export const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
});
