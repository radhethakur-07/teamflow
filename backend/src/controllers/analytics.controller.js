import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as analyticsService from '../services/analytics.service.js';

export const getWorkspaceAnalytics = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { timeframe } = req.query;

  const data = await analyticsService.getWorkspaceAnalytics(workspaceId, { timeframe });
  return sendSuccess(res, data, 'Analytics retrieved successfully', 200);
});
