import { NextResponse } from 'next/server';
import { getAllNumberStats, getLatestDraw } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// AI 주목 번호 = 점수 TOP 7
export async function GET() {
  const [stats, latest] = await Promise.all([getAllNumberStats(), getLatestDraw()]);
  const top = [...stats]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 7)
    .map((s) => ({ number: s.number, score: Number(s.score) }));
  return NextResponse.json({
    title: '🤖 AI 점수 TOP 7',
    latestRound: latest?.round ?? null,
    top,
  });
}
