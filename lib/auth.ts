import type { NextRequest } from 'next/server';

// Cron / 관리자 요청 인증
// - Vercel Cron: Authorization: Bearer <CRON_SECRET>
// - 수동 호출: ?token=<CRON_SECRET>
export function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const token = req.nextUrl.searchParams.get('token');
  if (token === secret) return true;
  return false;
}
