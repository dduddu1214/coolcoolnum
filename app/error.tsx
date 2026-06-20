'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 서버/클라이언트 콘솔에 원인 기록
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
      <div className="text-3xl">⚠️</div>
      <h2 className="mt-3 text-lg font-semibold">데이터를 불러오지 못했어요</h2>
      <p className="mt-2 text-sm text-zinc-400">
        아직 데이터가 수집되지 않았거나, 환경변수(Supabase 연결) 설정이
        필요할 수 있어요.
      </p>
      <ul className="mx-auto mt-4 max-w-md space-y-1 text-left text-xs text-zinc-500">
        <li>• Supabase 환경변수 4개가 등록되어 있는지 확인하세요.</li>
        <li>
          • 데이터가 비어 있다면{' '}
          <code className="text-zinc-400">/api/sync?full=1&amp;token=...</code>{' '}
          를 한 번 호출하세요.
        </li>
      </ul>
      {error.digest && (
        <p className="mt-4 text-xs text-zinc-600">오류 코드: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-5 rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-lime-400"
      >
        다시 시도
      </button>
    </div>
  );
}
