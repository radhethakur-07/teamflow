import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!authHeader) {
      return next(new Error('AUTHENTICATION_REQUIRED: No authorization token provided.'));
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      return next(new Error('INVALID_TOKEN: Token verification failed or expired.'));
    }

    const user = await User.findById(decoded.userId || decoded.id).select('-passwordHash');
    if (!user) {
      return next(new Error('USER_NOT_FOUND: User does not exist.'));
    }

    if (user.status && user.status !== 'active') {
      return next(new Error('ACCOUNT_INACTIVE: User account has been deactivated.'));
    }

    socket.user = user;
    socket.userId = user._id.toString();
    return next();
  } catch (error) {
    return next(new Error(`SOCKET_AUTH_ERROR: ${error.message}`));
  }
};

export default socketAuthMiddleware;
