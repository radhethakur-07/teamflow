import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#E98269', // Terracotta default
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active',
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound uniqueness: slug unique per workspace
projectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
projectSchema.index({ workspaceId: 1, status: 1 });
projectSchema.index({ workspaceId: 1, createdAt: -1 });

export const Project = mongoose.model('Project', projectSchema);
export default Project;
