import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { NumberBall } from '@/components/NumberBall';
import { getTopPairs } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PairsPage() {
  const pairs = await getTopPairs(50);
  if (pairs.length === 0) return <EmptyState />;
  const max = pairs[0].pair_count;

  return (
    <Card title="💞 공동 출현 TOP 50" subtitle="전체 회차 기준">
      <ol className="space-y-2">
        {pairs.map((p, idx) => {
          const pct = (p.pair_count / max) * 100;
          return (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl bg-zinc-900/50 px-3 py-2.5"
            >
              <span className="w-7 text-right text-xs text-zinc-500">
                #{idx + 1}
              </span>
              <NumberBall n={p.num_a} size="sm" link />
              <span className="text-zinc-600">↔</span>
              <NumberBall n={p.num_b} size="sm" link />
              <div className="ml-3 flex-1 h-2 rounded bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-lime-500/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-12 text-right text-sm font-medium">
                {p.pair_count}
              </span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
