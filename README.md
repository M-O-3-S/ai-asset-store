# AI Asset Store

사내 AI 코딩 도구(Cline, Cursor 등)용 **Skill · Rules · Persona · Prompt · Workflow**를 수집·배포하는 정적 스토어입니다.

GitHub Pages로 호스팅되며 외부 서버 없이 완전 정적 구조로 운영됩니다.

## 핵심 문서

| 문서 | 역할 |
|------|------|
| **[SPEC.md](./SPEC.md)** | 시스템 계약 — 스키마·카테고리·파이프라인 정의 (Single Source of Truth) |
| **[AGENTS.md](./AGENTS.md)** | AI 도구 운영 규칙 — Cline·Cursor·Claude가 공통으로 읽는 단일 규칙 소스 |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | asset 기여 가이드 |

> **개발 시작 전**: `SPEC.md`와 `AGENTS.md`를 먼저 읽으세요.
> 모든 코드·CI 설정이 SPEC.md를 계약으로 삼습니다.

## 레포 구조

```
store/          ← asset 원본 (skills / rules / personas / prompts / workflows)
site/           ← 웹 프론트엔드 소스
scripts/        ← 빌드·검증 스크립트
.github/        ← CI/CD 파이프라인
```

## 빠른 시작 (asset 추가)

```bash
# 1. 브랜치 생성
git checkout -b feature/add-my-asset

# 2. store/{category}/{id}/ 에 meta.json + body 파일 추가
#    → SPEC.md S3·S4 참조

# 3. ID 중복 검사
node scripts/check-asset-ids.js

# 4. PR 제출
```
