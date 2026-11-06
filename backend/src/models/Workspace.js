import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Workspace name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Workspace slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase alphanumeric characters and hyphens'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Workspace must have an owner'],
      index: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      enum: ['starter', 'pro', 'enterprise'],
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

workspaceSchema.index({ ownerId: 1, createdAt: -1 });

export const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
