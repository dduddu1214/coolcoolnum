import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { NumberBall } from '@/components/NumberBall';
import { getDrawByRound, getLatestDraw } from '@/lib/queries';
import { analyzeDraw } from '@/lib/stats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DrawsPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const { round: roundQ } = await searchParams;
  const latest = await getLatestDraw();
  if (!latest) return <EmptyState />;

  const targetRound = roundQ ? Math.max(1, Math.min(latest.round, Number(roundQ))) : latest.round;
  const draw = await getDrawByRound(targetRound);
  if (!draw) return <EmptyState />;
  const a = analyzeDraw(draw);

  return (
    <div className="space-y-6">
      <Card>
        <form className="flex flex-wrap items-end gap-3" action="/draws">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-400">회차 선택 (1 ~ {latest.round})</span>
            <input
              type="number"
              name="round"
              min={1}
              max={latest.round}
              defaultValue={targetRound}
              className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 w-40 text-sm focus:outline-none focus:border-lime-500"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-lime-400"
          >
            분석
          </button>
        </form>
      </Card>

      <Card title={`${draw.round}회 (${draw.draw_date})`}>
        <div className="flex flex-wrap items-center gap-3">
          {a.numbers.map((n) => (
            <NumberBall key={n} n={n} size="lg" link />
          ))}
          <span className="text-zinc-500">+</span>
          <NumberBall n={draw.bonus} size="lg" bonus link />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="📐 번호 합계 & 홀짝">
          <Stat label="합계" value={a.sum} />
          <Stat label="홀짝 비율" value={`${a.oddCount} : ${a.evenCount}`} />
          <Stat label="연속번호" value={a.consecutive ? '있음' : '없음'} />
        </Card>
        <Card title="🎯 구간 분포">
          <DistBar label="1~15" value={a.low} />
          <DistBar label="16~30" value={a.mid} />
          <DistBar label="31~45" value={a.high} />
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-baseline py-1.5">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function DistBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="py-1.5">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-zinc-500">{label}</span>
        <span>{value}개</span>
      </div>
      <div className="h-2 rounded bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-lime-500/70"
          style={{ width: `${(value / 6) * 100}%` }}
        />
      </div>
    </div>
  );
}
