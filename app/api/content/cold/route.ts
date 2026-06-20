import { NextResponse } from 'next/server';
import { getAllNumberStats, getLatestDraw } from '@/lib/queries';

export const dynamic = 'force-dynamic';

// 콜드 넘버 = 미출현 기간 TOP 7
export async function GET() {
  const [stats, latest] = await Promise.all([getAllNumberStats(), getLatestDraw()]);
  const cold = [...stats]
    .sort((a, b) => b.missing_rounds - a.missing_rounds)
    .slice(0, 7)
    .map((s) => ({
      number: s.number,
      missingRounds: s.missing_rounds,
      lastSeen: s.last_seen_round,
    }));
  return NextResponse.json({
    title: '🧊 오래 안 나온 번호',
    latestRound: latest?.round ?? null,
    cold,
  });
}
