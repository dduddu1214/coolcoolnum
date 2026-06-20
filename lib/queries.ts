// 읽기 전용 쿼리 헬퍼 (서버 컴포넌트 / API 공통)
import { supabase, type LottoDrawRow, type NumberStatRow, type PairStatRow } from './supabase';

// Supabase 쿼리 에러를 조용히 삼키지 않고 콘솔에 남긴다 (빈 화면 디버깅용)
function logErr(ctx: string, error: unknown): void {
  if (error) console.error(`[queries:${ctx}]`, error);
}

export async function getLatestDraw(): Promise<LottoDrawRow | null> {
  const { data, error } = await supabase
    .from('lotto_draws')
    .select('*')
    .order('round', { ascending: false })
    .limit(1)
    .maybeSingle();
  logErr('getLatestDraw', error);
  return (data as LottoDrawRow) ?? null;
}

export async function getRecentDraws(limit = 50): Promise<LottoDrawRow[]> {
  const { data, error } = await supabase
    .from('lotto_draws')
    .select('*')
    .order('round', { ascending: false })
    .limit(limit);
  logErr('getRecentDraws', error);
  return ((data ?? []) as LottoDrawRow[]).sort((a, b) => a.round - b.round);
}

export async function getDrawByRound(round: number): Promise<LottoDrawRow | null> {
  const { data, error } = await supabase
    .from('lotto_draws')
    .select('*')
    .eq('round', round)
    .maybeSingle();
  logErr('getDrawByRound', error);
  return (data as LottoDrawRow) ?? null;
}

export async function getAllNumberStats(): Promise<NumberStatRow[]> {
  const { data, error } = await supabase
    .from('number_stats')
    .select('*')
    .order('number', { ascending: true });
  logErr('getAllNumberStats', error);
  return (data ?? []) as NumberStatRow[];
}

export async function getNumberStat(n: number): Promise<NumberStatRow | null> {
  const { data, error } = await supabase
    .from('number_stats')
    .select('*')
    .eq('number', n)
    .maybeSingle();
  logErr('getNumberStat', error);
  return (data as NumberStatRow) ?? null;
}

export async function getPairsForNumber(n: number, limit = 10): Promise<PairStatRow[]> {
  const { data, error } = await supabase
    .from('pair_stats')
    .select('*')
    .or(`num_a.eq.${n},num_b.eq.${n}`)
    .order('pair_count', { ascending: false })
    .limit(limit);
  logErr('getPairsForNumber', error);
  return (data ?? []) as PairStatRow[];
}

export async function getTopPairs(limit = 50): Promise<PairStatRow[]> {
  const { data, error } = await supabase
    .from('pair_stats')
    .select('*')
    .order('pair_count', { ascending: false })
    .limit(limit);
  logErr('getTopPairs', error);
  return (data ?? []) as PairStatRow[];
}

export async function getAllDraws(): Promise<LottoDrawRow[]> {
  const { data, error } = await supabase
    .from('lotto_draws')
    .select('*')
    .order('round', { ascending: true });
  logErr('getAllDraws', error);
  return (data ?? []) as LottoDrawRow[];
}
