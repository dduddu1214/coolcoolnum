# Lotto Lab PRD v1.0

## 프로젝트명

Coolcool Number

부제

1회부터 최신 회차까지의 데이터를 분석하는 로또 데이터 연구소

---

# 프로젝트 목표

로또 번호를 예측하는 서비스가 아니다.

과거 데이터를 수집하고 분석하여

번호별 점수와 통계를 제공하는 데이터 연구 도구를 만든다.

1차 목표

* 내가 직접 사용할 분석 도구 구축
* 로또 데이터 자동 수집
* 번호 점수 계산
* 추천 조합 생성

2차 목표

* Threads/X 공유용 데이터 생성
* 공개 서비스 확장 가능성 검증

---

# 핵심 컨셉

기존

"AI가 이번 주 1등 번호를 예측합니다"

X

Lotto Lab

"과거 데이터를 기반으로 번호를 분석합니다"

O

---

# 기술 스택

Frontend

* Next.js 15 App Router
* TypeScript
* TailwindCSS
* shadcn/ui

Backend

* Next.js Route Handler

Database

* Supabase

Deployment

* Vercel

Automation

* Vercel Cron

Chart

* Recharts

---

# 데이터 수집

데이터 출처

동행복권

수집 정보

* 회차
* 추첨일
* 당첨번호 6개
* 보너스번호

---

# 자동 수집

최초 실행

1회 ~ 최신 회차 전체 수집

이후

매주 토요일

22:00

자동 실행

신규 회차만 저장

---

# DB 설계

## lotto_draws

id

round

draw_date

n1

n2

n3

n4

n5

n6

bonus

created_at

---

## number_stats

number

total_count

recent20_count

recent50_count

last_seen_round

missing_rounds

score

updated_at

---

## pair_stats

id

num_a

num_b

pair_count

updated_at

---

# 분석 엔진

## 1. 전체 출현 빈도

1~45 번호

출현 횟수 계산

---

## 2. 최근 20회 빈도

최근 흐름 계산

---

## 3. 최근 50회 빈도

중기 흐름 계산

---

## 4. 미출현 기간

마지막 출현 이후

몇 회 동안 나오지 않았는지 계산

---

## 5. 공동 출현

번호 조합 출현 횟수 계산

예

27 ↔ 34

18회

---

## 6. 홀짝 통계

회차별

홀짝 비율 계산

---

## 7. 번호 합계

당첨번호 합계 계산

평균 계산

---

## 8. 구간 분포

1~15

16~30

31~45

분포 계산

---

# 점수 알고리즘

Version 1

score

=

(totalCount * 0.20)

*

(recent20Count * 0.35)

*

(recent50Count * 0.20)

*

(missingRounds * 0.15)

*

(pairScore * 0.10)

최종

0~100 정규화

---

# 추천 번호 생성기

입력

없음

출력

추천 조합 5개

조건

* 홀짝 밸런스
* 번호 합계 필터
* 구간 분포 필터
* AI 점수 반영

---

# 화면 구성

## Dashboard

최신 회차

당첨번호

핫 넘버

콜드 넘버

AI 주목 번호

추천 조합

---

## Number Analysis

1~45 번호 목록

클릭 가능

---

## Number Detail

예

27번

표시

* 역대 출현 횟수
* 최근 20회
* 최근 50회
* 마지막 출현 회차
* 미출현 기간
* 점수
* 자주 같이 나온 번호

---

## Pair Ranking

공동 출현 TOP 50

---

## Draw Analysis

회차 선택

표시

* 번호
* 번호 합계
* 홀짝 비율
* 구간 분포
* 연속번호 여부

---

# 대시보드 카드

Hot Numbers

Cold Numbers

Top Score Numbers

최근 회차

평균 번호 합계

평균 홀짝 비율

---

# 콘텐츠 생성 API

향후 사용

/api/content/hot

/api/content/cold

/api/content/weekly

/api/content/top-score

JSON 반환

Threads 자동 생성용

---

# MVP 제외

로그인

회원가입

결제

광고

PDF 생성

사주 번호

생일 번호

꿈 번호

AI 채팅

---

# 완료 기준

1.

1회 ~ 최신 회차 데이터 저장 성공

2.

통계 자동 계산 성공

3.

점수 계산 성공

4.

추천 조합 생성 성공

5.

대시보드 시각화 완료

6.

Vercel 배포 완료

---

# 개발 우선순위

Day 1

DB 설계

데이터 수집

Supabase 저장

---

Day 2

통계 엔진

점수 엔진

---

Day 3

추천 번호 엔진

API 완성

---

Day 4

대시보드 UI

차트

---

Day 5

배포

Cron 연결

테스트

---

최종 목표

"가장 정확한 번호 생성기"

아님

"내가 매주 확인하고 싶은 로또 데이터 연구소"

이다.
