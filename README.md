# Coolcool Number

> 1회부터 최신 회차까지의 데이터를 분석하는 로또 데이터 연구소

예측이 아니다. 과거 데이터를 수집하고 분석해서 번호별 점수와 통계를 보여주는 도구.

## 스택

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres)
- Recharts
- Vercel + Vercel Cron (Fluid Compute)

## 셋업

```bash
# 1) 의존성
npm install

# 2) 환경변수
cp .env.local.example .env.local
# Supabase URL, anon key, service role key, CRON_SECRET 채우기

# 3) Supabase 스키마 적용
# Supabase Studio의 SQL Editor에서 supabase/schema.sql 실행

# 4) 개발 서버
npm run dev

# 5) 최초 전체 수집 (1회 ~ 최신 회차)
curl "http://localhost:3000/api/sync?full=1&token=$CRON_SECRET"
```

## 라우트

| Path | 설명 |
| --- | --- |
| `/` | 대시보드 (최신 회차 / Hot / Cold / Top Score / 추천 조합) |
| `/numbers` | 1~45 빈도 차트 + 그리드 |
| `/numbers/[n]` | 번호별 디테일 (점수, 미출현, 페어 TOP 10) |
| `/pairs` | 공동 출현 TOP 50 |
| `/draws?round=N` | 회차별 합계/홀짝/구간 분석 |
| `/api/sync` | 신규 회차만 수집 + 통계 재계산 (Cron) |
| `/api/sync?full=1` | 1회부터 전체 재수집 |
| `/api/recommend` | 추천 조합 5개 JSON |
| `/api/content/hot` | 핫 넘버 콘텐츠 (Threads/X용) |
| `/api/content/cold` | 콜드 넘버 콘텐츠 |
| `/api/content/top-score` | AI 점수 TOP 7 |
| `/api/content/weekly` | 최신 회차 주간 리포트 |

## 자동 수집

`vercel.json`에 토요일 22:00 KST (= UTC 13:00) 크론 등록됨.
신규 회차만 저장하고 통계를 다시 계산한다.

## 점수 알고리즘 (v1)

```
score = norm(totalCount)    * 0.20
      + norm(recent20Count) * 0.35
      + norm(recent50Count) * 0.20
      + norm(missingRounds) * 0.15
      + norm(pairSum)       * 0.10
      → 0~100 정규화
```

PRD의 곱셈 표기는 0 한 항으로 전체가 0이 되는 문제가 있어 가중합으로 구현.
