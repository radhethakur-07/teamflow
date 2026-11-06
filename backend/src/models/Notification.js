import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Target User ID is required'],
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['ASSIGNED', 'MENTIONED', 'DUE_SOON', 'STATUS_CHANGED', 'SYSTEM'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
    },
    link: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
