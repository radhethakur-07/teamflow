import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Invitee email is required'],
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'project_manager', 'team_member'],
      default: 'team_member',
    },
    token: {
      type: String,
      required: [true, 'Invitation token is required'],
      unique: true,
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inviting user is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'revoked', 'expired'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto-deletes expired records
    },
  },
  {
    timestamps: true,
  }
);

invitationSchema.index({ workspaceId: 1, email: 1, status: 1 });

export const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
