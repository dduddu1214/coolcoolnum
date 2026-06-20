import { NextRequest, NextResponse } from 'next/server';
import { getAllNumberStats } from '@/lib/queries';
import { generateCombos, type RecommendMode } from '@/lib/recommend';
import type { ScoredNumber } from '@/lib/score';

export const dynamic = 'force-dynamic';

const VALID_MODES: RecommendMode[] = ['balanced', 'hot', 'cold', 'random'];

// GET /api/recommend?mode=balanced|hot|cold|random&seed=123
export async function GET(req: NextRequest) {
  const modeParam = req.nextUrl.searchParams.get('mode') as RecommendMode | null;
  const mode: RecommendMode =
    modeParam && VALID_MODES.includes(modeParam) ? modeParam : 'balanced';
  const seedParam = req.nextUrl.searchParams.get('seed');
  const seed = seedParam ? Number(seedParam) : undefined;

  const stats = await getAllNumberStats();
  const scored: ScoredNumber[] = stats.map((s) => ({
    number: s.number,
    totalCount: s.total_count,
    recent20Count: s.recent20_count,
    recent50Count: s.recent50_count,
    lastSeenRound: s.last_seen_round,
    missingRounds: s.missing_rounds,
    pairScore: 0,
    score: Number(s.score),
  }));
  const combos = generateCombos(scored, 5, { mode, seed });
  return NextResponse.json({ mode, combos, generatedAt: new Date().toISOString() });
}
