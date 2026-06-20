import Link from 'next/link';

// 로또 공식 색상 구간
function ballColor(n: number): string {
  if (n <= 10) return 'bg-yellow-400 text-zinc-900';
  if (n <= 20) return 'bg-blue-500 text-white';
  if (n <= 30) return 'bg-red-500 text-white';
  if (n <= 40) return 'bg-zinc-300 text-zinc-900';
  return 'bg-green-500 text-white';
}

type Size = 'sm' | 'md' | 'lg';
const sizeClass: Record<Size, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

export function NumberBall({
  n,
  size = 'md',
  bonus = false,
  link = false,
}: {
  n: number;
  size?: Size;
  bonus?: boolean;
  link?: boolean;
}) {
  const inner = (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold shadow-sm ${ballColor(n)} ${sizeClass[size]} ${bonus ? 'ring-2 ring-amber-300 ring-offset-1 ring-offset-zinc-950' : ''}`}
    >
      {n}
    </span>
  );
  if (!link) return inner;
  return (
    <Link href={`/numbers/${n}`} className="hover:opacity-80 transition-opacity">
      {inner}
    </Link>
  );
}
