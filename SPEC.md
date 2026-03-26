# AI Asset Store — System Specification

> **이 문서가 Single Source of Truth입니다.**
> 코드·스크립트·CI 설정이 이 spec과 충돌하면 **spec이 우선**합니다.
> spec을 수정할 때는 하단 [Changelog](#changelog)에 영향받는 파일 목록을 기록하세요.

---

## S1. 프로젝트 목적

사내 AI 코딩 도구(Cline, Cursor 등)용 **재사용 가능한 asset**을 중앙에서 수집·배포하는 정적 스토어.

- 호스팅: GitHub Pages (추가 비용 없음)
- 외부 서버 연결 없는 **완전 정적 구조** (사내 보안 제약 대응)
- 배포 대상 도구: Cline, Cursor (추후 Codex 확장 예정)

---

## S2. 레포지토리 구조

```
repo root
├── .github/
│   └── workflows/
│       ├── deploy.yml          # main push → 빌드 → gh-pages 배포
│       └── validate-pr.yml     # store/** PR → asset ID 중복 검사
├── scripts/
│   ├── build-catalog.js        # store/ 수집 → dist/catalog.json 생성
│   └── check-asset-ids.js      # PR 검증용: meta.json id 중복 검사
├── site/
│   ├── index.html              # 스토어 프론트엔드
│   ├── style.css
│   └── app.js                  # catalog.json fetch → 카드 렌더링
├── store/
│   ├── skills/
│   ├── rules/
│   ├── personas/
│   ├── prompts/
│   └── workflows/
├── SPEC.md                     # ← 이 파일 (시스템 계약)
├── AGENTS.md                   # AI 도구 운영 규칙 (단일 소스)
├── CLAUDE.md                   # Claude Code 래퍼
├── .clinerules                 # Cline 래퍼
├── .cursor/rules/              # Cursor 래퍼
└── CONTRIBUTING.md
```

### 경로 간 의존성

| 변경 대상 | 함께 수정해야 할 파일 |
|----------|-------------------|
| `store/` 디렉토리 구조 | `scripts/build-catalog.js`, `deploy.yml` 루프 |
| `meta.json` 필드 추가/삭제 | `site/app.js` 렌더링 코드 |
| asset 카테고리 추가 | S3 테이블, `deploy.yml` 루프, `site/index.html` 필터 버튼 |
| `dist/catalog.json` 경로 변경 | `site/app.js` fetch URL |

---

## S3. Asset 타입 레지스트리

> 새 타입을 추가하면 이 테이블, `deploy.yml` 루프, `site/index.html` 필터 버튼 **3곳을 동기화**해야 합니다.

| `type` 값 | 디렉토리 | body 파일명 | 설명 |
|----------|---------|-----------|------|
| `skill` | `store/skills/` | `SKILL.md` | Cline/Cursor 에이전트 지침 |
| `rules` | `store/rules/` | `.clinerules` | 코딩 규칙 파일 |
| `persona` | `store/personas/` | `persona.md` | AI 역할 페르소나 정의 |
| `prompt` | `store/prompts/` | `prompt.md` | 재사용 가능한 프롬프트 템플릿 |
| `workflow` | `store/workflows/` | `workflow.md` | 복합 작업 워크플로 정의 |

---

## S4. meta.json 스키마

모든 asset의 `meta.json`은 아래 필드를 **빠짐없이** 포함해야 합니다.

```json
{
  "id":          "string   — 소문자·숫자·하이픈만, 레포 내 유일",
  "type":        "string   — S3 타입 레지스트리의 type 값 중 하나",
  "title":       "string   — 표시용 제목 (한국어 가능)",
  "description": "string   — 2문장 이내 설명",
  "tags":        "string[] — 검색용 태그 배열",
  "tools":       "string[] — 지원 도구 (cline | cursor | codex)",
  "author":      "string   — 작성자 이메일 또는 팀명",
  "version":     "string   — semver 형식 (예: 1.0.0)",
  "updated":     "string   — ISO 8601 날짜 (예: 2026-03-26)",
  "file":        "string   — body 파일명 (S3 타입별 파일명 규칙 준수)",
  "preview":     "string   — 200자 이내 미리보기 텍스트"
}
```

### 필드 제약

| 필드 | 타입 | 제약 |
|------|------|------|
| `id` | string | `^[a-z0-9-]+$`, 레포 전체 유일 |
| `type` | enum | S3 테이블의 값만 허용 |
| `version` | string | `^[0-9]+\.[0-9]+\.[0-9]+$` |
| `updated` | string | `^[0-9]{4}-[0-9]{2}-[0-9]{2}$` |
| `tools` | string[] | `cline` \| `cursor` \| `codex` |
| `preview` | string | 200자 이하 |

### 예시

```json
{
  "id": "embedded-c-refactor",
  "type": "skill",
  "title": "임베디드 C 리팩토링 가이드",
  "description": "SOLID 원칙 기반 C 코드 개선 에이전트 지침.",
  "tags": ["embedded", "C", "refactoring"],
  "tools": ["cline", "cursor"],
  "author": "team-firmware@company.com",
  "version": "1.2.0",
  "updated": "2026-03-20",
  "file": "SKILL.md",
  "preview": "HAL 레이어 분리, 전역 변수 최소화, 단위 테스트 가능한 구조로 개선합니다."
}
```

---

## S5. 빌드 & 배포 파이프라인

### 트리거

| 이벤트 | 실행 워크플로 |
|-------|------------|
| `main` 브랜치 push | `deploy.yml` |
| `main` 타겟 PR (`store/**` 변경) | `validate-pr.yml` |

### 빌드 산출물 (`dist/`)

```
dist/
├── catalog.json          # 모든 meta.json 병합, updated 역순 정렬
├── zips/
│   └── {asset-id}.tar.gz # 각 asset 폴더 압축
├── index.html
├── style.css
└── app.js
```

### 파이프라인 순서 (`deploy.yml`)

1. `node scripts/build-catalog.js` → `dist/catalog.json` 생성
2. 카테고리별 루프 → `dist/zips/{name}.tar.gz` 생성
3. `site/*` → `dist/` 복사
4. `peaceiris/actions-gh-pages@v4` → `gh-pages` 브랜치 배포

### PR 검증 (`validate-pr.yml`)

- `store/**` 변경이 포함된 PR에서만 실행
- `node scripts/check-asset-ids.js` 실행
- `id` 중복 또는 누락 시 exit(1) → PR merge 불가

---

## S6. 프론트엔드 기능 명세

### 데이터 소스

- 페이지 로드 시 `catalog.json` fetch (상대 경로)
- 외부 라이브러리 없음 (vanilla JS)

### 기능

| 기능 | 동작 |
|------|------|
| 타입 필터 | 버튼 클릭 → `type` 필드 기준 필터 (전체/skill/rules/persona/prompt/workflow) |
| 텍스트 검색 | 입력 → `title`, `description`, `tags` 대상 부분 일치 |
| 카드 표시 필드 | `title`, `type` 배지, `description` (2줄 클램프), `tags` (최대 4개), `version` |
| 모달 표시 필드 | `type`, `title`, `description`, `tags` 전체, `version`, `updated`, `author`, `tools` |
| 다운로드 | `<a href="zips/{id}.tar.gz" download>` 직접 링크 |

---

## S7. 규칙 & 정책

### ID 네이밍 규칙

- 소문자 영문, 숫자, 하이픈(`-`)만 사용
- 레포 전체에서 유일해야 함 (카테고리 무관)
- 예: `embedded-c-refactor`, `python-code-review`

### 브랜치 전략

```
main      → asset 원본 + 사이트 소스 (PR 필수, 직접 push 금지)
gh-pages  → Actions bot 전용 (직접 push 전면 금지)
feature/  → 기여 브랜치 (예: feature/add-react-persona)
```

### PR 정책

- `main` 타겟 PR: 리뷰어 1명 이상 승인 필수
- `store/**` 변경 PR: `check-asset-ids` CI 통과 필수
- PR 1개 = 관심사 1개 (asset 추가와 사이트 수정을 섞지 않는 것을 권장)

### 금지 항목

- `gh-pages` 브랜치 직접 push
- S3에 등록되지 않은 `type` 값 사용
- S4에 없는 필드를 `meta.json`에 임의 추가
- 민감정보 (API 키, 내부 IP, 개인 이메일) asset에 포함

---

## Changelog

| 날짜 | 변경 내용 | 영향 파일 |
|------|---------|---------|
| 2026-03-26 | 초기 spec 작성 | 전체 |
