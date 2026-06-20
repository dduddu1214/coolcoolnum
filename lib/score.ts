// 점수 알고리즘 v1
// PRD 공식은 곱셈 표기지만 0 값 하나로 전체가 0이 되는 문제가 있어,
// 정규화된 항의 가중합으로 구현한다 (같은 의도, 더 안정적).
import type { NumberStat, PairStat } from './stats';

const W = {
  total: 0.20,
  recent20: 0.35,
  recent50: 0.20,
  missing: 0.15,
  pair: 0.10,
} as const;

export type ScoredNumber = NumberStat & {
  pairScore: number;
  score: number; // 0~100
};

export function computeScores(
  stats: NumberStat[],
  pairs: PairStat[],
): ScoredNumber[] {
  // 번호별 페어 점수 = 그 번호가 포함된 페어들의 카운트 합 (상위만)
  const pairSum = new Array<number>(46).fill(0);
  for (const p of pairs) {
    pairSum[p.numA] += p.pairCount;
    pairSum[p.numB] += p.pairCount;
  }

  const norm = (vals: number[]) => {
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    return vals.map((v) => (v - min) / range);
  };

  const total = norm(stats.map((s) => s.totalCount));
  const r20 = norm(stats.map((s) => s.recent20Count));
  const r50 = norm(stats.map((s) => s.recent50Count));
  // 미출현 기간은 길수록 "곧 나올 것"으로 가중 (반전 X — 그대로 가중)
  const miss = norm(stats.map((s) => s.missingRounds));
  const pair = norm(stats.map((s) => pairSum[s.number]));

  return stats.map((s, i) => {
    const raw =
      total[i] * W.total +
      r20[i] * W.recent20 +
      r50[i] * W.recent50 +
      miss[i] * W.missing +
      pair[i] * W.pair;
    return {
      ...s,
      pairScore: pairSum[s.number],
      score: Math.round(raw * 10000) / 100, // 0~100, 소수 둘째자리
    };
  });
}
