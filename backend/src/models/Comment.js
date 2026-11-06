import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
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
      required: [true, 'Task ID is required'],
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      maxlength: [3000, 'Comment cannot exceed 3000 characters'],
    },
    mentions: [
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

commentSchema.index({ taskId: 1, createdAt: 1 });
commentSchema.index({ workspaceId: 1, createdAt: -1 });

export const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
