import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
      <div className="text-3xl">🔍</div>
      <h2 className="mt-3 text-lg font-semibold">페이지를 찾을 수 없어요</h2>
      <p className="mt-2 text-sm text-zinc-400">
        없는 번호(1~45 범위 밖)이거나 잘못된 주소예요.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-lg bg-lime-500 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-lime-400"
      >
        대시보드로
      </Link>
    </div>
  );
}
