import { Attachment } from '../models/Attachment.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
];

export const getTaskAttachments = async (taskId, workspaceId) => {
  const task = await Task.findOne({ _id: taskId, workspaceId, isArchived: false });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  return Attachment.find({ taskId, workspaceId })
    .populate('uploaderId', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .lean();
};

export const createTaskAttachment = async (
  taskId,
  workspaceId,
  uploaderId,
  { fileName, fileUrl, fileSize = 0, mimeType = 'application/octet-stream' }
) => {
  const task = await Task.findOne({ _id: taskId, workspaceId, isArchived: false });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  if (!fileName || !fileUrl) {
    const error = new Error('File name and file URL are required.');
    error.statusCode = 400;
    error.code = 'INVALID_PAYLOAD';
    throw error;
  }

  if (fileSize > MAX_FILE_SIZE) {
    const error = new Error('File size exceeds the 10MB maximum upload limit.');
    error.statusCode = 400;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  // Validate MIME type if known
  if (mimeType !== 'application/octet-stream' && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    const error = new Error(`Unsupported file type: ${mimeType}.`);
    error.statusCode = 400;
    error.code = 'UNSUPPORTED_FILE_TYPE';
    throw error;
  }

  const attachment = await Attachment.create({
    workspaceId,
    taskId,
    uploaderId,
    fileName,
    fileUrl,
    fileSize,
    mimeType,
  });

  await ActivityLog.create({
    workspaceId,
    projectId: task.projectId,
    taskId: task._id,
    actorId: uploaderId,
    action: 'ATTACHMENT_ADDED',
    details: { fileName, fileSize, mimeType },
  });

  return attachment.populate('uploaderId', 'name email avatarUrl');
};

export const deleteAttachment = async (attachmentId, workspaceId, userId, userRole) => {
  const attachment = await Attachment.findOne({ _id: attachmentId, workspaceId });
  if (!attachment) {
    const error = new Error('Attachment not found.');
    error.statusCode = 404;
    error.code = 'ATTACHMENT_NOT_FOUND';
    throw error;
  }

  const isUploader = attachment.uploaderId.toString() === userId.toString();
  const isAdminOrOwner = ['workspace_owner', 'admin'].includes(userRole);

  if (!isUploader && !isAdminOrOwner) {
    const error = new Error('You do not have permission to delete this attachment.');
    error.statusCode = 403;
    error.code = 'INSUFFICIENT_PERMISSIONS';
    throw error;
  }

  await Attachment.findByIdAndDelete(attachmentId);

  await ActivityLog.create({
    workspaceId,
    taskId: attachment.taskId,
    actorId: userId,
    action: 'ATTACHMENT_DELETED',
    details: { fileName: attachment.fileName },
  });

  return { success: true };
};
