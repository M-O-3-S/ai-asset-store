# Git 커밋 메시지 생성기

## 프롬프트

아래 변경 내용을 분석하여 Conventional Commits 규격에 맞는 커밋 메시지를 생성해주세요.

**변경 내용:**
```
{{DIFF_OR_DESCRIPTION}}
```

## 출력 규칙

### Type 선택 기준
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서만 변경
- `style`: 코드 동작에 영향 없는 포맷 변경 (공백, 세미콜론 등)
- `refactor`: 버그 수정도 기능 추가도 아닌 코드 변경
- `perf`: 성능 개선
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드 프로세스, 보조 도구 변경
- `ci`: CI 설정 변경

### 형식
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 규칙
- subject는 50자 이내, 현재형 동사로 시작 (한국어 가능)
- body는 72자 줄바꿈, 변경 이유와 이전 동작 설명
- BREAKING CHANGE는 footer에 명시

## 출력 예시 3개
변경 내용을 분석하여 가장 적합한 메시지 1개와 대안 2개를 제안해주세요.
