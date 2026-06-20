// 통계 엔진 — PRD 분석 8종
import type { LottoDrawRow } from './supabase';

export type NumberStat = {
  number: number;
  totalCount: number;
  recent20Count: number;
  recent50Count: number;
  lastSeenRound: number | null;
  missingRounds: number;
};

export type PairStat = {
  numA: number;
  numB: number;
  pairCount: number;
};

export type DrawAnalysis = {
  round: number;
  drawDate: string;
  numbers: number[];
  bonus: number;
  sum: number;
  oddCount: number;
  evenCount: number;
  low: number; // 1~15
  mid: number; // 16~30
  high: number; // 31~45
  consecutive: boolean;
};

const draws6 = (d: LottoDrawRow) =>
  [d.n1, d.n2, d.n3, d.n4, d.n5, d.n6] as const;

// 1. 전체 출현 빈도 + 2/3. 최근 N회 + 4. 미출현 기간
export function computeNumberStats(
  draws: LottoDrawRow[], // round desc 또는 asc 무관, 내부에서 정렬
): NumberStat[] {
  const sorted = [...draws].sort((a, b) => a.round - b.round);
  const latest = sorted[sorted.length - 1]?.round ?? 0;

  const total = new Array<number>(46).fill(0);
  const lastSeen = new Array<number | null>(46).fill(null);

  for (const d of sorted) {
    for (const n of draws6(d)) {
      total[n]++;
      lastSeen[n] = d.round;
    }
  }

  const recent20 = sliceWindow(sorted, 20);
  const recent50 = sliceWindow(sorted, 50);

  const stats: NumberStat[] = [];
  for (let n = 1; n <= 45; n++) {
    stats.push({
      number: n,
      totalCount: total[n],
      recent20Count: recent20[n],
      recent50Count: recent50[n],
      lastSeenRound: lastSeen[n],
      missingRounds: lastSeen[n] == null ? latest : latest - lastSeen[n]!,
    });
  }
  return stats;
}

function sliceWindow(sortedAsc: LottoDrawRow[], window: number): number[] {
  const arr = new Array<number>(46).fill(0);
  const start = Math.max(0, sortedAsc.length - window);
  for (let i = start; i < sortedAsc.length; i++) {
    for (const n of draws6(sortedAsc[i])) arr[n]++;
  }
  return arr;
}

// 5. 공동 출현
export function computePairStats(draws: LottoDrawRow[]): PairStat[] {
  const counts = new Map<string, number>();
  for (const d of draws) {
    const ns = draws6(d);
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        const a = Math.min(ns[i], ns[j]);
        const b = Math.max(ns[i], ns[j]);
        const k = `${a},${b}`;
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }
  }
  const out: PairStat[] = [];
  for (const [k, v] of counts) {
    const [a, b] = k.split(',').map(Number);
    out.push({ numA: a, numB: b, pairCount: v });
  }
  out.sort((x, y) => y.pairCount - x.pairCount);
  return out;
}

// 6/7/8. 회차별 홀짝, 합계, 구간 분포
export function analyzeDraw(d: LottoDrawRow): DrawAnalysis {
  const nums = draws6(d).slice().sort((a, b) => a - b);
  const sum = nums.reduce((s, n) => s + n, 0);
  const odd = nums.filter((n) => n % 2 === 1).length;
  const low = nums.filter((n) => n <= 15).length;
  const mid = nums.filter((n) => n >= 16 && n <= 30).length;
  const high = nums.filter((n) => n >= 31).length;
  let consec = false;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] - nums[i - 1] === 1) {
      consec = true;
      break;
    }
  }
  return {
    round: d.round,
    drawDate: d.draw_date,
    numbers: nums,
    bonus: d.bonus,
    sum,
    oddCount: odd,
    evenCount: 6 - odd,
    low,
    mid,
    high,
    consecutive: consec,
  };
}
