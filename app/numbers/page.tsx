import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FrequencyChart } from '@/components/FrequencyChart';
import { NumberBall } from '@/components/NumberBall';
import { getAllNumberStats } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NumbersPage() {
  const stats = await getAllNumberStats();
  if (stats.length === 0) return <EmptyState />;

  const sortedByScore = [...stats].sort((a, b) => Number(b.score) - Number(a.score));
  const rankOf = new Map(sortedByScore.map((s, i) => [s.number, i + 1]));
  const maxScore = Number(sortedByScore[0]?.score ?? 100);

  return (
    <div className="space-y-6">
      <Card title="📈 1~45 출현 빈도" subtitle="전체 회차 기준">
        <FrequencyChart
          data={stats.map((s) => ({ number: s.number, count: s.total_count }))}
        />
      </Card>

      <Card title="🎱 번호별 분석" subtitle="클릭해서 디테일 보기">
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
          {stats.map((s) => {
            const pct = (Number(s.score) / Math.max(maxScore, 1)) * 100;
            return (
              <a
                key={s.number}
                href={`/numbers/${s.number}`}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-2 hover:border-lime-500/40 hover:bg-zinc-900/80 transition"
              >
                <NumberBall n={s.number} />
                <div className="text-[10px] text-zinc-500">
                  #{rankOf.get(s.number)} · {Number(s.score).toFixed(0)}점
                </div>
                <div className="h-1 w-full rounded bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-lime-500/70"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-400">
                  전체 {s.total_count}회
                </div>
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
