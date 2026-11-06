import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
};
