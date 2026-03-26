# AI Asset Store — Agent Rules

> 이 파일은 Cline · Cursor · Claude Code · GitHub Copilot이 공통으로 읽는 **단일 운영 규칙 소스**입니다.
> 시스템 계약(스키마, 카테고리, 파이프라인)은 **SPEC.md**를 참조하세요.

---

## Commands

```bash
# 새 asset 대화형 생성 (디렉토리·meta.json·body 파일 자동 생성)
node scripts/new-asset.js

# asset ID 중복 검사 (store/ 변경 후 반드시 실행)
node scripts/check-asset-ids.js

# 카탈로그 빌드 로컬 확인
node scripts/build-catalog.js
# → dist/catalog.json 생성됨
```

---

## Project Structure

| 경로 | 역할 |
|------|------|
| `SPEC.md` | 시스템 계약 — 스키마·카테고리·파이프라인 정의 |
| `store/{type}/{id}/` | asset 원본 파일 |
| `scripts/build-catalog.js` | store/ → dist/catalog.json 빌드 |
| `scripts/check-asset-ids.js` | PR 검증: id 중복 검사 |
| `site/` | 정적 프론트엔드 소스 |
| `dist/` | 빌드 산출물 (git 추적 안 함) |
| `.github/workflows/` | CI/CD 파이프라인 |

---

## Asset Workflow

새 asset을 추가할 때의 절차:

1. **SPEC.md S3** 에서 `type` 확인 → 디렉토리와 body 파일명 결정
2. **SPEC.md S4** 에서 `meta.json` 스키마 확인
3. `store/{category}/{id}/` 디렉토리 생성
4. `meta.json` 작성 (모든 필드 필수)
5. body 파일 작성 (S3의 파일명 규칙 준수)
6. `node scripts/check-asset-ids.js` 실행으로 ID 중복 검증
7. `feature/add-{id}` 브랜치로 PR 제출

### meta.json 필수 필드 (빠른 참조)

```json
{
  "id":          "소문자-하이픈-영숫자",
  "type":        "skill | rules | persona | prompt | workflow",
  "title":       "표시 제목",
  "description": "2문장 이내",
  "tags":        ["태그1", "태그2"],
  "tools":       ["cline", "cursor"],
  "author":      "email@company.com",
  "version":     "1.0.0",
  "updated":     "YYYY-MM-DD",
  "file":        "SKILL.md",
  "preview":     "200자 이내 미리보기"
}
```

---

## Code Style

### scripts/ (Node.js)

- `'use strict'` 선언 필수
- 외부 npm 패키지 사용 금지 (Node.js 내장 모듈만)
- 에러 발생 시 `process.exit(1)` + 명확한 메시지 출력

### site/ (Vanilla JS)

- 외부 라이브러리 없음 (JSZip, jQuery 등 금지)
- 사용자 입력은 반드시 `esc()` 함수로 이스케이프 (XSS 방지)
- `catalog.json` 스키마 변경 시 `site/app.js` 렌더링 코드도 동기화

---

## Git Workflow

```
main 브랜치
  ← PR (리뷰어 1명 이상 승인 필수)
  ← feature/add-{asset-id}   asset 추가
  ← feature/fix-{description} 버그 수정
  ← feature/update-{target}   기능 개선
```

- 커밋 메시지: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`)
- PR 1개 = 관심사 1개 (asset 추가와 사이트 수정 분리 권장)

---

## Boundaries

**절대 하지 말아야 할 것:**

- `gh-pages` 브랜치에 직접 push (Actions bot 전용)
- SPEC.md S3에 없는 `type` 값을 `meta.json`에 사용
- SPEC.md S4에 없는 필드를 `meta.json`에 임의 추가
- asset에 민감정보 포함 (API 키, 내부 IP, 개인 이메일)
- SPEC.md를 사용자 승인 없이 수정
