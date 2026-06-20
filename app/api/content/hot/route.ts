import { NextResponse } from 'next/server';
import { getAllNumberStats, getLatestDraw } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// 핫 넘버 = 최근 20회 출현 빈도 TOP 7
export async function GET() {
  const [stats, latest] = await Promise.all([getAllNumberStats(), getLatestDraw()]);
  const hot = [...stats]
    .sort((a, b) => b.recent20_count - a.recent20_count || b.total_count - a.total_count)
    .slice(0, 7)
    .map((s) => ({ number: s.number, recent20: s.recent20_count, total: s.total_count }));
  return NextResponse.json({
    title: '🔥 최근 20회 핫 넘버',
    latestRound: latest?.round ?? null,
    hot,
  });
}
