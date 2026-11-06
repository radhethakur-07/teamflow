import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as attachmentService from '../services/attachment.service.js';
import * as cloudinaryService from '../services/cloudinary.service.js';

export const getTaskAttachments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const workspaceId = req.workspaceId;

  const attachments = await attachmentService.getTaskAttachments(taskId, workspaceId);
  return sendSuccess(res, attachments, 'Attachments retrieved successfully', 200);
});

export const createTaskAttachment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const workspaceId = req.workspaceId;
  const { fileName, fileUrl, fileSize, mimeType } = req.body;

  const attachment = await attachmentService.createTaskAttachment(
    taskId,
    workspaceId,
    req.user._id,
    { fileName, fileUrl, fileSize, mimeType }
  );

  return sendCreated(res, attachment, 'Attachment uploaded successfully');
});

export const deleteAttachment = asyncHandler(async (req, res) => {
  const { attachmentId } = req.params;
  const workspaceId = req.workspaceId;

  const result = await attachmentService.deleteAttachment(
    attachmentId,
    workspaceId,
    req.user._id,
    req.memberRole
  );

  return sendSuccess(res, result, 'Attachment removed successfully', 200);
});

export const getUploadSignature = asyncHandler(async (req, res) => {
  const { folder, tags } = req.query;
  const signatureData = cloudinaryService.generateUploadSignature({ folder, tags });
  return sendSuccess(res, signatureData, 'Upload signature generated', 200);
});

export const uploadAsset = asyncHandler(async (req, res) => {
  const { fileData, folder } = req.body;
  const result = await cloudinaryService.uploadBase64Asset(fileData, { folder });
  return sendSuccess(res, result, 'File uploaded successfully', 200);
});
