import Link from 'next/link';
import { Card } from './Card';

export function EmptyState() {
  return (
    <Card>
      <div className="py-12 text-center space-y-3">
        <div className="text-3xl">🌱</div>
        <h2 className="text-lg font-semibold">데이터가 아직 없어요</h2>
        <p className="text-sm text-zinc-400">
          Supabase에 스키마를 적용하고 <code className="text-zinc-300">/api/sync?full=1&amp;token=...</code> 으로 초기 수집을 실행하세요.
        </p>
        <div className="text-xs text-zinc-500">
          1. <code>supabase/schema.sql</code> 적용 ·{' '}
          2. <code>.env.local</code> 환경변수 설정 ·{' '}
          3. 최초 1회{' '}
          <Link href="/api/sync?full=1" className="text-lime-400 underline">
            /api/sync?full=1
          </Link>{' '}
          호출
        </div>
      </div>
    </Card>
  );
}
