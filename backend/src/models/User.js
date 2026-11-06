import mongoose from 'mongoose';
import { hashPassword, comparePassword } from '../utils/password.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    defaultWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      index: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password against passwordHash
userSchema.methods.verifyPassword = async function (password) {
  return comparePassword(password, this.passwordHash);
};

// Safe JSON serialization (strip passwordHash and internal properties)
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', userSchema);
export default User;
