import { z } from 'zod';

export const createTaskSchema = z.object({
  params: z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Task title is required').max(250),
    description: z.string().optional(),
    column: z.enum(['todo', 'inprogress', 'review', 'done']).default('todo'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    dueDate: z.string().optional().nullable(),
    assigneeIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    tags: z.array(z.string().max(30)).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(250).optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().optional().nullable(),
    assigneeIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    tags: z.array(z.string().max(30)).optional(),
    isArchived: z.boolean().optional(),
  }),
});

export const moveTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    column: z.enum(['todo', 'inprogress', 'review', 'done']),
    orderIndex: z.number().optional(),
  }),
});

export const addChecklistItemSchema = z.object({
  params: z.object({
    taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(300),
  }),
});
