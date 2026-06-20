import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// 클라이언트는 빌드 시점이 아니라 첫 사용 시점에 생성한다.
// (모듈 로드 시 env가 없으면 next build의 페이지 데이터 수집 단계가 깨진다)
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY is not set'
    );
  }
  client = createClient(url, anonKey, { auth: { persistSession: false } });
  return client;
}

// 기존 `supabase.from(...)` 호출부를 그대로 두기 위한 lazy proxy
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

export function supabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export type LottoDrawRow = {
  id: number;
  round: number;
  draw_date: string;
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  n6: number;
  bonus: number;
  created_at: string;
};

export type NumberStatRow = {
  number: number;
  total_count: number;
  recent20_count: number;
  recent50_count: number;
  last_seen_round: number | null;
  missing_rounds: number;
  score: number;
  updated_at: string;
};

export type PairStatRow = {
  id: number;
  num_a: number;
  num_b: number;
  pair_count: number;
  updated_at: string;
};
