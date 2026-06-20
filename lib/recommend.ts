// 추천 조합 생성기
// 점수 가중 + 홀짝 밸런스 / 합계 / 구간 분포 필터를 통과한 조합 5개
import type { ScoredNumber } from './score';

export type Combo = {
  numbers: number[]; // 정렬됨
  sum: number;
  oddCount: number;
  low: number;
  mid: number;
  high: number;
  scoreSum: number;
};

// 추천 모드 — 어떤 통계를 뽑기 가중치로 쓸지 결정한다.
// 로또는 랜덤이라 어느 모드도 적중률은 같다. "관점"의 차이일 뿐.
export type RecommendMode = 'balanced' | 'hot' | 'cold' | 'random';

export const RECOMMEND_MODES: { id: RecommendMode; label: string; desc: string }[] = [
  { id: 'balanced', label: '밸런스', desc: '종합 점수 가중' },
  { id: 'hot', label: '핫', desc: '최근 20회 많이 나온 번호 가중' },
  { id: 'cold', label: '콜드', desc: '오래 안 나온 번호 가중' },
  { id: 'random', label: '순수 랜덤', desc: '가중치 없음 (정직한 기준선)' },
];

function weightOf(s: ScoredNumber, mode: RecommendMode): number {
  switch (mode) {
    case 'hot':
      return Math.max(s.recent20Count, 0.5);
    case 'cold':
      return Math.max(s.missingRounds, 0.5);
    case 'random':
      return 1;
    case 'balanced':
    default:
      return Math.max(s.score, 0.5);
  }
}

const SUM_MIN = 100;
const SUM_MAX = 175;

function pickWeighted(weights: number[], rng: () => number): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let t = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    t -= weights[i];
    if (t <= 0) return i;
  }
  return weights.length - 1;
}

function isValid(c: Combo): boolean {
  if (c.sum < SUM_MIN || c.sum > SUM_MAX) return false;
  // 홀짝 2:4, 3:3, 4:2 만 허용
  if (c.oddCount < 2 || c.oddCount > 4) return false;
  // 한 구간에 5개 이상 몰리지 않게
  if (c.low >= 5 || c.mid >= 5 || c.high >= 5) return false;
  return true;
}

function makeCombo(nums: number[], scoreLookup: Map<number, number>): Combo {
  const sorted = [...nums].sort((a, b) => a - b);
  let sum = 0,
    odd = 0,
    low = 0,
    mid = 0,
    high = 0,
    scoreSum = 0;
  for (const n of sorted) {
    sum += n;
    if (n % 2 === 1) odd++;
    if (n <= 15) low++;
    else if (n <= 30) mid++;
    else high++;
    scoreSum += scoreLookup.get(n) ?? 0;
  }
  return { numbers: sorted, sum, oddCount: odd, low, mid, high, scoreSum };
}

export function generateCombos(
  scored: ScoredNumber[],
  count = 5,
  opts: { seed?: number; mode?: RecommendMode } = {},
): Combo[] {
  const { seed = Date.now(), mode = 'balanced' } = opts;
  // 결정적 PRNG (mulberry32)
  let s = seed >>> 0;
  const rng = () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const numbers = scored.map((s) => s.number);
  const weights = scored.map((s) => weightOf(s, mode));
  const scoreLookup = new Map(scored.map((s) => [s.number, s.score]));

  const out: Combo[] = [];
  const seen = new Set<string>();
  let safety = 0;
  while (out.length < count && safety++ < 5000) {
    const picked = new Set<number>();
    const w = [...weights];
    while (picked.size < 6) {
      const idx = pickWeighted(w, rng);
      picked.add(numbers[idx]);
      w[idx] = 0; // 중복 방지
    }
    const combo = makeCombo([...picked], scoreLookup);
    if (!isValid(combo)) continue;
    const key = combo.numbers.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(combo);
  }
  // 점수 합 내림차순
  out.sort((a, b) => b.scoreSum - a.scoreSum);
  return out;
}
