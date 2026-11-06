import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const taskSchema = new mongoose.Schema(
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
      required: [true, 'Project ID is required'],
      index: true,
    },
    column: {
      type: String,
      enum: ['todo', 'inprogress', 'in_progress', 'review', 'in_review', 'done', 'completed'],
      default: 'todo',
      index: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
    },
    assigneeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    checklist: [checklistItemSchema],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-frequency query indexes
taskSchema.index({ projectId: 1, column: 1, orderIndex: 1 });
taskSchema.index({ workspaceId: 1, isArchived: 1 });
taskSchema.index({ workspaceId: 1, assigneeIds: 1 });
taskSchema.index({ workspaceId: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model('Task', taskSchema);
export default Task;
