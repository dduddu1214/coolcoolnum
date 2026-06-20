'use client';

import { useState } from 'react';
import { NumberBall } from '@/components/NumberBall';
import { RECOMMEND_MODES, type Combo, type RecommendMode } from '@/lib/recommend';

export function Recommender({ initialCombos }: { initialCombos: Combo[] }) {
  const [mode, setMode] = useState<RecommendMode>('balanced');
  const [combos, setCombos] = useState<Combo[]>(initialCombos);
  const [loading, setLoading] = useState(false);

  async function load(nextMode: RecommendMode) {
    setMode(nextMode);
    setLoading(true);
    try {
      const seed = Date.now();
      const res = await fetch(`/api/recommend?mode=${nextMode}&seed=${seed}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setCombos(data.combos ?? []);
    } catch {
      // 네트워크 오류 시 기존 조합 유지
    } finally {
      setLoading(false);
    }
  }

  const activeDesc = RECOMMEND_MODES.find((m) => m.id === mode)?.desc ?? '';

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {RECOMMEND_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => load(m.id)}
            disabled={loading}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              mode === m.id
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {m.label}
          </button>
        ))}
        <button
          onClick={() => load(mode)}
          disabled={loading}
          className="ml-auto rounded-full bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? '뽑는 중…' : '🎲 다시 뽑기'}
        </button>
      </div>
      <p className="mb-3 text-xs text-zinc-500">{activeDesc}</p>

      <ul className="space-y-3">
        {combos.map((c) => (
          <li
            key={c.numbers.join('-')}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800/60 p-3"
          >
            {c.numbers.map((n) => (
              <NumberBall key={n} n={n} link />
            ))}
            <div className="ml-auto text-xs text-zinc-500">
              합 {c.sum} · 홀{c.oddCount}짝{6 - c.oddCount} · 구간 {c.low}:{c.mid}:
              {c.high} · 점수합 {c.scoreSum.toFixed(1)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
