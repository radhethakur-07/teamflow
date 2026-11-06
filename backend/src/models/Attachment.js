import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader ID is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream',
    },
  },
  {
    timestamps: true,
  }
);

attachmentSchema.index({ taskId: 1, createdAt: -1 });
attachmentSchema.index({ workspaceId: 1, createdAt: -1 });

export const Attachment = mongoose.model('Attachment', attachmentSchema);
export default Attachment;
