import { z } from 'zod';

export const createProjectSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  }),
  body: z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters').max(120),
    description: z.string().max(1000).optional(),
    coverImage: z.string().optional().or(z.literal('')),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color').optional(),
    teamId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    memberIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    dueDate: z.string().optional().nullable(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(1000).optional(),
    coverImage: z.string().optional().or(z.literal('')),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).optional(),
    status: z.enum(['active', 'archived', 'completed']).optional(),
    teamId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    leadId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional().nullable(),
    memberIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    dueDate: z.string().optional().nullable(),
  }),
});
