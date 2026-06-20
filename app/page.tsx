import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { NumberBall } from '@/components/NumberBall';
import {
  getAllNumberStats,
  getLatestDraw,
  getRecentDraws,
  getTopPairs,
} from '@/lib/queries';
import { generateCombos } from '@/lib/recommend';
import { Recommender } from '@/components/Recommender';
import { analyzeDraw } from '@/lib/stats';
import type { ScoredNumber } from '@/lib/score';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  const [latest, recent, stats, pairs] = await Promise.all([
    getLatestDraw(),
    getRecentDraws(20),
    getAllNumberStats(),
    getTopPairs(50),
  ]);

  if (!latest || stats.length === 0) return <EmptyState />;

  const latestAnalysis = analyzeDraw(latest);

  const hot = [...stats]
    .sort((a, b) => b.recent20_count - a.recent20_count)
    .slice(0, 7);
  const cold = [...stats]
    .sort((a, b) => b.missing_rounds - a.missing_rounds)
    .slice(0, 7);
  const top = [...stats]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 7);
  const unlikely = [...stats]
    .sort((a, b) => Number(a.score) - Number(b.score))
    .slice(0, 7);

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
  const combos = generateCombos(scored, 5, { seed: latest.round, mode: 'balanced' });

  const recentAnalyses = recent.map(analyzeDraw);
  const avgSum =
    recentAnalyses.reduce((s, a) => s + a.sum, 0) / Math.max(recentAnalyses.length, 1);
  const avgOdd =
    recentAnalyses.reduce((s, a) => s + a.oddCount, 0) / Math.max(recentAnalyses.length, 1);

  return (
    <div className="space-y-6">
      {/* 최신 회차 */}
      <Card
        title={`${latest.round}회 (${latest.draw_date})`}
        subtitle="최신 당첨번호"
      >
        <div className="flex flex-wrap items-center gap-3">
          {latestAnalysis.numbers.map((n) => (
            <NumberBall key={n} n={n} size="lg" link />
          ))}
          <span className="text-zinc-500">+</span>
          <NumberBall n={latest.bonus} size="lg" bonus link />
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Stat label="합계" value={latestAnalysis.sum} />
          <Stat label="홀:짝" value={`${latestAnalysis.oddCount}:${latestAnalysis.evenCount}`} />
          <Stat
            label="구간 (저:중:고)"
            value={`${latestAnalysis.low}:${latestAnalysis.mid}:${latestAnalysis.high}`}
          />
          <Stat label="연속번호" value={latestAnalysis.consecutive ? '있음' : '없음'} />
        </div>
      </Card>

      {/* 핫/콜드/탑스코어/회피 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="🔥 Hot Numbers" subtitle="최근 20회">
          <BallRow nums={hot.map((s) => s.number)} />
        </Card>
        <Card title="🧊 Cold Numbers" subtitle="미출현 기간">
          <BallRow nums={cold.map((s) => s.number)} />
          <p className="mt-3 text-xs text-zinc-500">
            가장 오래 안 나옴: {cold[0]?.number}번 ({cold[0]?.missing_rounds}회)
          </p>
        </Card>
        <Card title="🤖 Top Score" subtitle="AI 점수">
          <BallRow nums={top.map((s) => s.number)} />
          <p className="mt-3 text-xs text-zinc-500">
            최고점: {top[0]?.number}번 ({Number(top[0]?.score).toFixed(1)}점)
          </p>
        </Card>
        <Card title="🚫 안 나올 것 같은 번호" subtitle="최저 점수">
          <BallRow nums={unlikely.map((s) => s.number)} />
          <p className="mt-3 text-xs text-zinc-500">
            최저점: {unlikely[0]?.number}번 ({Number(unlikely[0]?.score).toFixed(1)}점)
          </p>
        </Card>
      </div>

      {/* 추천 조합 */}
      <Card title="🎯 추천 조합 5개" subtitle="모드 선택 + 필터 통과">
        <Recommender initialCombos={combos} />
      </Card>

      {/* 메타 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="📊 최근 20회 평균">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="평균 합계" value={avgSum.toFixed(1)} />
            <Stat label="평균 홀짝 비율" value={`${((avgOdd / 6) * 100).toFixed(1)}%`} />
            <Stat label="분석된 회차" value={recent.length} />
            <Stat label="저장된 회차" value={latest.round} />
          </div>
        </Card>
        <Card title="💞 자주 같이 나온 페어 TOP 5">
          <ul className="space-y-2 text-sm">
            {pairs.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <NumberBall n={p.num_a} size="sm" link />
                <span className="text-zinc-500">↔</span>
                <NumberBall n={p.num_b} size="sm" link />
                <span className="ml-auto text-zinc-400">{p.pair_count}회</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-zinc-900/60 px-3 py-2.5">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-0.5 text-base font-semibold">{value}</div>
    </div>
  );
}

function BallRow({ nums }: { nums: number[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {nums.map((n) => (
        <NumberBall key={n} n={n} link />
      ))}
    </div>
  );
}
