import apiClient from './api.js';

export const attachmentService = {
  /**
   * Fetch all attachments for a specific task
   */
  async getTaskAttachments(taskId) {
    const res = await apiClient.get(`/v1/tasks/${taskId}/attachments`);
    return res.data;
  },

  /**
   * Record a new attachment entry for a task
   */
  async createTaskAttachment(taskId, { fileName, fileUrl, fileSize, mimeType }) {
    const res = await apiClient.post(`/v1/tasks/${taskId}/attachments`, {
      fileName,
      fileUrl,
      fileSize,
      mimeType,
    });
    return res.data;
  },

  /**
   * Delete an attachment from a task
   */
  async deleteAttachment(taskId, attachmentId) {
    const res = await apiClient.delete(`/v1/tasks/${taskId}/attachments/${attachmentId}`);
    return res.data;
  },

  /**
   * Get signature for direct Cloudinary upload
   */
  async getUploadSignature(folder = 'teamflow/attachments') {
    const res = await apiClient.get('/v1/upload/signature', {
      params: { folder },
    });
    return res.data;
  },

  /**
   * Upload asset via server endpoint (supports data URI or Cloudinary relay)
   */
  async uploadAsset(fileData, folder = 'teamflow/attachments') {
    const res = await apiClient.post('/v1/upload', {
      fileData,
      folder,
    });
    return res.data;
  },

  /**
   * High-level helper: reads File object as DataURL, uploads it, and links it to task
   */
  async uploadFileToTask(taskId, file) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File exceeds maximum upload limit of 10MB.');
    }

    // Convert file to Base64 / Data URL
    const fileDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    // 1. Upload to storage (Cloudinary or local dev fallback)
    const uploadResult = await this.uploadAsset(fileDataUrl, 'teamflow/attachments');
    const fileUrl = uploadResult.url;

    // 2. Persist attachment record to MongoDB
    const attachmentRecord = await this.createTaskAttachment(taskId, {
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
    });

    return attachmentRecord;
  },
};

export default attachmentService;
