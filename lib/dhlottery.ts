// 로또 회차 데이터 fetcher
//
// 동행복권 비공식 JSON API(common.do?method=getLottoNumber)는 2026년부터
// 봇 차단(WAF)으로 막혀 error.html로 리다이렉트된다. 그래서 유지보수되는
// 공개 미러를 데이터 소스로 사용한다.
//   - 전체:   https://smok95.github.io/lotto/results/all.json
//   - 단일:   https://smok95.github.io/lotto/results/{round}.json
//   - 미존재 회차는 404
const SOURCE_ALL = 'https://smok95.github.io/lotto/results/all.json';
const SOURCE_ONE = (round: number) =>
  `https://smok95.github.io/lotto/results/${round}.json`;

// 미러 응답 형태
type MirrorDraw = {
  draw_no: number;
  numbers: number[];
  bonus_no: number;
  date: string; // ISO, 예: "2023-12-30T00:00:00Z"
};

export type LottoDraw = {
  round: number;
  drawDate: string; // YYYY-MM-DD
  numbers: [number, number, number, number, number, number];
  bonus: number;
};

function toLottoDraw(m: MirrorDraw): LottoDraw | null {
  if (
    !m ||
    typeof m.draw_no !== 'number' ||
    !Array.isArray(m.numbers) ||
    m.numbers.length !== 6
  ) {
    return null;
  }
  return {
    round: m.draw_no,
    drawDate: (m.date ?? '').slice(0, 10),
    numbers: m.numbers as [number, number, number, number, number, number],
    bonus: m.bonus_no,
  };
}

// all.json을 한 요청 내에서 한 번만 받도록 메모이즈한다.
let allCache: Promise<LottoDraw[]> | null = null;

async function fetchAll(): Promise<LottoDraw[]> {
  if (allCache) return allCache;
  allCache = (async () => {
    const res = await fetch(SOURCE_ALL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`lotto source fetch failed: HTTP ${res.status}`);
    }
    const json = (await res.json()) as MirrorDraw[];
    const draws = json
      .map(toLottoDraw)
      .filter((d): d is LottoDraw => d !== null);
    draws.sort((a, b) => a.round - b.round);
    return draws;
  })();
  return allCache;
}

export async function fetchDraw(round: number): Promise<LottoDraw | null> {
  const res = await fetch(SOURCE_ONE(round), { cache: 'no-store' });
  if (!res.ok) return null;
  const json = (await res.json()) as MirrorDraw;
  return toLottoDraw(json);
}

// 최신(가장 큰) 회차 번호
export async function findLatestRound(): Promise<number> {
  const draws = await fetchAll();
  if (draws.length === 0) return 0;
  return draws[draws.length - 1].round;
}

export async function fetchDrawRange(
  from: number,
  to: number,
): Promise<LottoDraw[]> {
  const draws = await fetchAll();
  return draws.filter((d) => d.round >= from && d.round <= to);
}
