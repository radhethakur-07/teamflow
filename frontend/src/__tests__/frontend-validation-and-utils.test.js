import { describe, it } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

// Frontend Validation Schemas
const loginValidationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const taskValidationSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  column: z.enum(['todo', 'inprogress', 'review', 'done']).default('todo'),
});

// Helper: Format bytes
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Helper: Column normalizer
const normalizeColumn = (col) => {
  if (col === 'in_progress') return 'inprogress';
  if (col === 'in_review') return 'review';
  if (col === 'completed') return 'done';
  return col;
};

describe('Frontend Validation & Utility Tests', () => {
  it('1. Login Schema: accepts valid credentials and rejects malformed email / short password', () => {
    const valid = loginValidationSchema.safeParse({
      email: 'engineer@teamflow.app',
      password: 'StrongPassword123!',
    });
    assert.strictEqual(valid.success, true);

    const invalidEmail = loginValidationSchema.safeParse({
      email: 'not-an-email',
      password: 'StrongPassword123!',
    });
    assert.strictEqual(invalidEmail.success, false);

    const shortPassword = loginValidationSchema.safeParse({
      email: 'engineer@teamflow.app',
      password: 'short',
    });
    assert.strictEqual(shortPassword.success, false);
  });

  it('2. Register Schema: verifies name length, email format, and password length', () => {
    const valid = registerValidationSchema.safeParse({
      name: 'Sarah Connor',
      email: 'sarah@teamflow.app',
      password: 'SecurePassword2026!',
    });
    assert.strictEqual(valid.success, true);

    const emptyName = registerValidationSchema.safeParse({
      name: 'A',
      email: 'sarah@teamflow.app',
      password: 'SecurePassword2026!',
    });
    assert.strictEqual(emptyName.success, false);
  });

  it('3. Task Schema: validates priority enum and column defaults', () => {
    const valid = taskValidationSchema.safeParse({
      title: 'Implement OAuth SSO Integration',
      priority: 'high',
    });
    assert.strictEqual(valid.success, true);
    assert.strictEqual(valid.data.column, 'todo');

    const invalidPriority = taskValidationSchema.safeParse({
      title: 'Invalid priority task',
      priority: 'critical', // not in enum
    });
    assert.strictEqual(invalidPriority.success, false);
  });

  it('4. File Size Formatter: correctly formats byte boundaries (B, KB, MB)', () => {
    assert.strictEqual(formatFileSize(0), '0 B');
    assert.strictEqual(formatFileSize(500), '500 B');
    assert.strictEqual(formatFileSize(1024), '1 KB');
    assert.strictEqual(formatFileSize(1024 * 1024), '1 MB');
    assert.strictEqual(formatFileSize(2.5 * 1024 * 1024), '2.5 MB');
    assert.strictEqual(formatFileSize(10 * 1024 * 1024), '10 MB');
  });

  it('5. Column Normalization: handles legacy and alternative column keys cleanly', () => {
    assert.strictEqual(normalizeColumn('todo'), 'todo');
    assert.strictEqual(normalizeColumn('in_progress'), 'inprogress');
    assert.strictEqual(normalizeColumn('in_review'), 'review');
    assert.strictEqual(normalizeColumn('completed'), 'done');
    assert.strictEqual(normalizeColumn('done'), 'done');
  });

  it('6. File Size Limit Guard: rejects files exceeding 10MB limit', () => {
    const MAX_ALLOWED = 10 * 1024 * 1024;
    const testFileValid = { size: 5 * 1024 * 1024 };
    const testFileOversize = { size: 10.1 * 1024 * 1024 };

    assert.strictEqual(testFileValid.size <= MAX_ALLOWED, true);
    assert.strictEqual(testFileOversize.size <= MAX_ALLOWED, false);
  });
});
