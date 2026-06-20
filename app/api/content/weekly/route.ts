import { NextResponse } from 'next/server';
import { getLatestDraw, getRecentDraws } from '@/lib/queries';
import { analyzeDraw } from '@/lib/stats';

export const dynamic = 'force-dynamic';

// 주간 리포트 = 최신 회차 + 최근 N회 평균
export async function GET() {
  const [latest, recent] = await Promise.all([getLatestDraw(), getRecentDraws(20)]);
  if (!latest) return NextResponse.json({ error: 'no data' }, { status: 404 });

  const latestAnalysis = analyzeDraw(latest);
  const analyses = recent.map(analyzeDraw);
  const avgSum =
    analyses.reduce((s, a) => s + a.sum, 0) / Math.max(analyses.length, 1);
  const avgOdd =
    analyses.reduce((s, a) => s + a.oddCount, 0) / Math.max(analyses.length, 1);

  return NextResponse.json({
    title: `📊 ${latest.round}회 주간 리포트`,
    latest: latestAnalysis,
    last20Average: {
      sum: Math.round(avgSum * 10) / 10,
      oddRatio: Math.round((avgOdd / 6) * 1000) / 10, // %
    },
  });
}
