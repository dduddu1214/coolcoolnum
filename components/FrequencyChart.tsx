'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type FreqDatum = { number: number; count: number };

export function FrequencyChart({ data }: { data: FreqDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="number" tick={{ fill: '#a1a1aa', fontSize: 11 }} interval={2} />
        <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} width={40} />
        <Tooltip
          contentStyle={{
            background: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: '#fafafa' }}
        />
        <Bar dataKey="count" fill="#a3e635" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
