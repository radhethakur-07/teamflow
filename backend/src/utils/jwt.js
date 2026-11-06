import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const generateTokens = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry || '15m',
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry || '7d',
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};
