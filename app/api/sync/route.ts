import { NextRequest, NextResponse } from 'next/server';
import { syncAndRecompute } from '@/lib/sync';
import { isAuthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Fluid Compute 기본 5분

// GET /api/sync           - 신규 회차만
// GET /api/sync?full=1    - 1회부터 전체 재수집
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const full = req.nextUrl.searchParams.get('full') === '1';
  try {
    const result = await syncAndRecompute({ full });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
