# 기여 가이드

AI Asset Store에 기여해 주셔서 감사합니다.

## 기여 플로우

```
1. main에서 feature/add-{asset-name} 브랜치 생성
2. store/{category}/{asset-name}/ 디렉토리에 파일 추가
3. PR 제출 → 리뷰어 승인
4. main merge → GitHub Actions 자동 빌드·배포
```

## 카테고리 선택

| 카테고리 | 디렉토리 | 설명 |
|---|---|---|
| Skill | `store/skills/` | Cline/Cursor 에이전트 지침 |
| Rules | `store/rules/` | `.clinerules` / `.cursorrules` |
| Persona | `store/personas/` | AI 역할 페르소나 정의 |
| Prompt | `store/prompts/` | 재사용 가능한 프롬프트 템플릿 |
| Workflow | `store/workflows/` | 복합 작업 워크플로 정의 |

## 필수 파일

각 asset 폴더에는 반드시 두 파일이 필요합니다.

### 1. meta.json

```json
{
  "id": "my-asset-name",
  "type": "skill",
  "title": "asset 제목",
  "description": "한 두 문장으로 asset을 설명합니다.",
  "tags": ["태그1", "태그2"],
  "tools": ["cline", "cursor"],
  "author": "your-email@company.com",
  "version": "1.0.0",
  "updated": "YYYY-MM-DD",
"file": "SKILL.md",
  "preview": "검색 결과에 노출될 200자 이내 미리보기 텍스트"
}
```

### 2. asset 본문 파일

- Skill: `SKILL.md`
- Rules: `.clinerules` (또는 `.cursorrules`)
- Persona: `persona.md`
- Prompt: `prompt.md`
- Workflow: `workflow.md`

## ID 규칙

- 소문자, 영문, 숫자, 하이픈(`-`)만 사용
- 예: `embedded-c-refactor`, `python-code-review`
- 레포 내 고유해야 함

## PR 체크리스트

- [ ] `meta.json` 필드 모두 채움
- [ ] `id`가 레포 내 유일함
- [ ] `type`이 카테고리 디렉토리와 일치
- [ ] asset 본문 파일 존재
- [ ] 개인정보, 시크릿, 내부 IP 등 민감정보 미포함
- [ ] 다른 사람이 바로 사용할 수 있는 수준의 완성도

## 브랜치 보호 정책

| 브랜치 | 정책 |
|---|---|
| `main` | PR 필수, 리뷰어 1명 이상 승인 |
| `gh-pages` | GitHub Actions bot만 push 허용 |

> `gh-pages`에 직접 push하지 마세요. Actions가 자동으로 배포합니다.
