import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
    description: z.string().max(500).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const inviteMemberSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
  }),
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    role: z.enum(['admin', 'project_manager', 'team_member']).default('team_member'),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID'),
    memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'),
  }),
  body: z.object({
    role: z.enum(['admin', 'project_manager', 'team_member']),
  }),
});
