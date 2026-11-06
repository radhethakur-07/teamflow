import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is missing or malformed.',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload || !payload.userId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'The access token has expired or is invalid.',
      },
    });
  }

  try {
    const user = await User.findById(payload.userId).select('-passwordHash');

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_ACTIVE',
          message: 'User account not found or is suspended.',
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Error verifying authentication status.',
      },
    });
  }
};

export default authenticateJWT;
