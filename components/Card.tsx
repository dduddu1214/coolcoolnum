import type { ReactNode } from 'react';

export function Card({
  title,
  subtitle,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 ${className}`}
    >
      {(title || subtitle) && (
        <header className="mb-4 flex items-baseline justify-between">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {subtitle && <span className="text-xs text-zinc-500">{subtitle}</span>}
        </header>
      )}
      {children}
    </section>
  );
}
