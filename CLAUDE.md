# Claude Code 작업 지침

## 시작 전 필독

작업 시작 전 반드시 두 파일을 읽어라:

1. **`SPEC.md`** — 시스템 계약 (스키마·카테고리·파이프라인)
2. **`AGENTS.md`** — 운영 규칙 (asset 추가 절차·코드 스타일·금지 사항)

이 두 파일이 모든 결정의 기준이다. 코드와 SPEC이 충돌하면 **코드를 수정**하라.

---

## Claude 전용 추가 지침

- **SPEC 수정 전**: 영향받는 파일 목록을 사용자에게 먼저 보고하라 (SPEC.md S2 의존성 표 참조)
- **새 카테고리 추가 시**: SPEC S3 테이블 → `deploy.yml` 루프 → `site/index.html` 필터 버튼 3곳을 반드시 동기화하라
- **meta.json 스키마 변경 시**: `site/app.js` 렌더링 코드와 동기화하라
- **작업 완료 후**: `node scripts/check-asset-ids.js`로 ID 중복 검증

## 파일 구조 빠른 참조

```
SPEC.md                      ← 계약 (변경 시 사용자 승인 필요)
AGENTS.md                    ← 운영 규칙 (모든 AI 도구 공유)
scripts/build-catalog.js     ← store/ → dist/catalog.json
scripts/check-asset-ids.js   ← ID 중복 검사
site/app.js                  ← catalog.json fetch + 렌더링
.github/workflows/deploy.yml ← main push → gh-pages 배포
```
