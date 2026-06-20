// 데이터 동기화 — Supabase 저장 + 통계 재계산
import { fetchDrawRange, findLatestRound } from './dhlottery';
import { computeNumberStats, computePairStats } from './stats';
import { computeScores } from './score';
import { supabaseAdmin, type LottoDrawRow } from './supabase';

export type SyncResult = {
  collected: number;
  fromRound: number;
  toRound: number;
  statsUpdated: boolean;
};

export async function syncAndRecompute(opts?: { full?: boolean }): Promise<SyncResult> {
  const admin = supabaseAdmin();

  // 현재 DB의 최신 회차
  const { data: maxRow } = await admin
    .from('lotto_draws')
    .select('round')
    .order('round', { ascending: false })
    .limit(1)
    .maybeSingle();
  const dbLatest = (maxRow?.round as number | undefined) ?? 0;

  const remoteLatest = await findLatestRound();
  const fromRound = opts?.full ? 1 : dbLatest + 1;
  const toRound = remoteLatest;

  let collected = 0;
  if (fromRound <= toRound) {
    const draws = await fetchDrawRange(fromRound, toRound);
    if (draws.length) {
      const rows = draws.map((d) => ({
        round: d.round,
        draw_date: d.drawDate,
        n1: d.numbers[0],
        n2: d.numbers[1],
        n3: d.numbers[2],
        n4: d.numbers[3],
        n5: d.numbers[4],
        n6: d.numbers[5],
        bonus: d.bonus,
      }));
      const { error } = await admin
        .from('lotto_draws')
        .upsert(rows, { onConflict: 'round' });
      if (error) throw new Error(`draw upsert failed: ${error.message}`);
      collected = rows.length;
    }
  }

  // 통계 재계산 (전체 회차 기반)
  const { data: all, error: allErr } = await admin
    .from('lotto_draws')
    .select('*')
    .order('round', { ascending: true });
  if (allErr) throw new Error(`fetch all draws failed: ${allErr.message}`);
  const draws = (all ?? []) as LottoDrawRow[];

  if (draws.length === 0) {
    return { collected, fromRound, toRound, statsUpdated: false };
  }

  const numberStats = computeNumberStats(draws);
  const pairStats = computePairStats(draws);
  const scored = computeScores(numberStats, pairStats);

  // number_stats 업서트
  const numRows = scored.map((s) => ({
    number: s.number,
    total_count: s.totalCount,
    recent20_count: s.recent20Count,
    recent50_count: s.recent50Count,
    last_seen_round: s.lastSeenRound,
    missing_rounds: s.missingRounds,
    score: s.score,
    updated_at: new Date().toISOString(),
  }));
  const { error: nErr } = await admin
    .from('number_stats')
    .upsert(numRows, { onConflict: 'number' });
  if (nErr) throw new Error(`number_stats upsert failed: ${nErr.message}`);

  // pair_stats: 상위 990개만 (모두 990조합)
  const pairRows = pairStats.map((p) => ({
    num_a: p.numA,
    num_b: p.numB,
    pair_count: p.pairCount,
    updated_at: new Date().toISOString(),
  }));
  const { error: pErr } = await admin
    .from('pair_stats')
    .upsert(pairRows, { onConflict: 'num_a,num_b' });
  if (pErr) throw new Error(`pair_stats upsert failed: ${pErr.message}`);

  return { collected, fromRound, toRound, statsUpdated: true };
}
