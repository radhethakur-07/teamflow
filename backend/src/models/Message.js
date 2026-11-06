import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    channelId: {
      type: String,
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    readBy: [
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

messageSchema.index({ workspaceId: 1, channelId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
export default Message;
