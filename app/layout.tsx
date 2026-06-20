import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Coolcool Number — 로또 데이터 연구소',
  description: '1회부터 최신 회차까지의 데이터를 분석하는 로또 데이터 연구소',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
          <nav className="mx-auto max-w-6xl flex items-center gap-6 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold tracking-tight">
              <span className="text-lime-400">●</span> Coolcool Number
            </Link>
            <div className="ml-auto flex gap-4 text-zinc-400">
              <Link href="/" className="hover:text-zinc-100">Dashboard</Link>
              <Link href="/numbers" className="hover:text-zinc-100">Numbers</Link>
              <Link href="/pairs" className="hover:text-zinc-100">Pairs</Link>
              <Link href="/draws" className="hover:text-zinc-100">Draws</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl w-full flex-1 px-4 py-8">{children}</main>
        <footer className="border-t border-zinc-800/60 mt-12">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-zinc-500">
            과거 데이터 기반 분석 도구입니다. 예측이 아닙니다.
          </div>
        </footer>
      </body>
    </html>
  );
}
