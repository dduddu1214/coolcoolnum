import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/Card';
import { NumberBall } from '@/components/NumberBall';
import { getLatestDraw, getNumberStat, getPairsForNumber } from '@/lib/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NumberDetail({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n: nStr } = await params;
  const n = Number(nStr);
  if (!Number.isInteger(n) || n < 1 || n > 45) notFound();

  const [stat, latest, pairs] = await Promise.all([
    getNumberStat(n),
    getLatestDraw(),
    getPairsForNumber(n, 10),
  ]);

  if (!stat || !latest) {
    return (
      <Card>
        <div className="py-12 text-center text-zinc-400">데이터가 없습니다.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <NumberBall n={n} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{n}번 분석</h1>
          <p className="text-sm text-zinc-500">
            최신 회차 {latest.round}회 ({latest.draw_date}) 기준
          </p>
        </div>
        <Link
          href="/numbers"
          className="ml-auto text-sm text-zinc-400 hover:text-zinc-100"
        >
          ← 전체 보기
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="📊 기본 통계">
          <Stat label="역대 출현" value={`${stat.total_count}회`} />
          <Stat label="최근 20회" value={`${stat.recent20_count}회`} />
          <Stat label="최근 50회" value={`${stat.recent50_count}회`} />
        </Card>
        <Card title="⏳ 출현 간격">
          <Stat
            label="마지막 출현"
            value={stat.last_seen_round ? `${stat.last_seen_round}회` : '없음'}
          />
          <Stat label="미출현 기간" value={`${stat.missing_rounds}회`} />
        </Card>
        <Card title="🤖 AI 점수">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-lime-400">
              {Number(stat.score).toFixed(1)}
            </span>
            <span className="text-zinc-500 text-sm">/ 100</span>
          </div>
          <div className="h-2 rounded bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-lime-500"
              style={{ width: `${Math.min(Number(stat.score), 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            출현 빈도 + 최근 흐름 + 미출현 기간 + 페어 점수
          </p>
        </Card>
      </div>

      <Card title={`💞 ${n}번과 자주 같이 나온 번호 TOP 10`}>
        <ul className="space-y-2">
          {pairs.map((p) => {
            const partner = p.num_a === n ? p.num_b : p.num_a;
            return (
              <li key={p.id} className="flex items-center gap-3">
                <NumberBall n={partner} size="sm" link />
                <span className="text-sm text-zinc-400">
                  {n}↔{partner}
                </span>
                <span className="ml-auto text-sm font-medium">
                  {p.pair_count}회
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-1.5">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
