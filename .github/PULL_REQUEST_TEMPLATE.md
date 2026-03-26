## 변경 유형

- [ ] Asset 추가 (`store/` 파일 추가)
- [ ] 사이트/스크립트 수정 (`site/`, `scripts/` 변경)
- [ ] 문서 수정 (`SPEC.md`, `AGENTS.md`, `CONTRIBUTING.md` 등)
- [ ] CI/CD 변경 (`.github/workflows/`)
- [ ] 기타

---

## 변경 내용 요약

<!-- 무엇을, 왜 변경했는지 간략히 설명해 주세요 -->

---

## Asset PR 체크리스트 (asset 추가 시만 작성)

### meta.json
- [ ] 모든 필드 작성 완료 (`id`, `type`, `title`, `description`, `tags`, `tools`, `author`, `version`, `updated`, `file`, `preview`)
- [ ] `id`가 레포 내 유일함 (`node scripts/check-asset-ids.js` 통과)
- [ ] `type`이 `store/` 디렉토리와 일치 (SPEC.md S3 참조)
- [ ] `preview`가 200자 이하

### 콘텐츠
- [ ] body 파일 존재 (`SKILL.md` / `.clinerules` / `persona.md` / `prompt.md` / `workflow.md`)
- [ ] 바로 사용 가능한 완성도 (미완성 템플릿 미포함)

### 보안
- [ ] API 키, 내부 IP, 개인 이메일 등 민감정보 미포함

---

## 코드 변경 체크리스트 (site/scripts/CI 수정 시만 작성)

- [ ] SPEC.md와 충돌 없음 (코드와 SPEC이 충돌 시 코드를 수정)
- [ ] 새 카테고리 추가 시 `deploy.yml` 루프 · `site/index.html` 필터 버튼 동기화 완료
- [ ] `catalog.json` 스키마 변경 시 `site/app.js` 렌더링 코드 동기화 완료
- [ ] 외부 npm 패키지 미추가 (Node.js 내장 모듈만 사용)
