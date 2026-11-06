import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
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
  },
  {
    timestamps: true,
  }
);

// Compound uniqueness: Team name unique within a workspace
teamSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

export const Team = mongoose.model('Team', teamSchema);
export default Team;
