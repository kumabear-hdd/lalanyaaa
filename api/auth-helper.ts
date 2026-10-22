import type { Request } from 'express';

/**
 * Checks if the request is authorized to perform mutations (upload, edit, delete, reset).
 * - If ADMIN_PASSCODE is not set in environment variables, write access is permitted by default.
 * - If ADMIN_PASSCODE is configured in Vercel, the caller must supply the matching passcode in the
 *   'x-admin-passcode' header or Authorization header.
 * - Public read operations (GET) are ALWAYS allowed without any passcode so visitors/partners can view.
 */
export function isAuthorizedAdmin(req: Request): boolean {
  const adminPasscode = process.env.ADMIN_PASSCODE;
  if (!adminPasscode || adminPasscode.trim() === '') {
    return true;
  }

  const provided =
    (req.headers['x-admin-passcode'] as string) ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  return provided?.trim() === adminPasscode.trim();
}
