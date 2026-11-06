import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor ID is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'WORKSPACE_CREATED',
        'MEMBER_JOINED',
        'MEMBER_REMOVED',
        'ROLE_UPDATED',
        'TEAM_CREATED',
        'PROJECT_CREATED',
        'PROJECT_ARCHIVED',
        'TASK_CREATED',
        'TASK_MOVED',
        'TASK_UPDATED',
        'TASK_COMPLETED',
        'TASK_DELETED',
        'COMMENT_ADDED',
        'ATTACHMENT_ADDED',
        'ATTACHMENT_DELETED',
      ],
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ workspaceId: 1, createdAt: -1 });
activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ taskId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
