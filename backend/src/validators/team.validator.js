import { z } from 'zod';

export const createTeamSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lead ID').optional(),
    memberIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
  }),
});

export const updateTeamSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
    teamId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid team ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    memberIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  }),
});
