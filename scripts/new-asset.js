#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── SPEC S3 타입 레지스트리 ───────────────────────────────
const TYPE_REGISTRY = {
  skill:    { dir: 'store/skills',    file: 'SKILL.md' },
  rules:    { dir: 'store/rules',     file: '.clinerules' },
  persona:  { dir: 'store/personas',  file: 'persona.md' },
  prompt:   { dir: 'store/prompts',   file: 'prompt.md' },
  workflow: { dir: 'store/workflows', file: 'workflow.md' },
};

const TOOLS_MAP = {
  '1': ['cline'],
  '2': ['cursor'],
  '3': ['cline', 'cursor'],
};

// ── body 파일 템플릿 ──────────────────────────────────────
function bodyTemplate(type, title) {
  switch (type) {
    case 'skill':
      return `# ${title}\n\n## 목적\n\n\n## 적용 규칙\n\n### 1. \n\n## 사용 방법\n`;
    case 'rules':
      return `# ${title}\n\n## 규칙\n\n### 1. \n`;
    case 'persona':
      return `# ${title}\n\n## 역할 정의\n\n\n## 핵심 관점\n\n\n## 커뮤니케이션 스타일\n`;
    case 'prompt':
      return `# ${title}\n\n## 프롬프트\n\n**입력:**\n\`\`\`\n{{INPUT}}\n\`\`\`\n\n## 출력 규칙\n`;
    case 'workflow':
      return `# ${title}\n\n## 단계\n\n1. \n2. \n3. \n`;
    default:
      return `# ${title}\n`;
  }
}

// ── 기존 ID 목록 수집 (중복 검사용) ─────────────────────
function collectExistingIds(storeDir) {
  const ids = new Set();
  if (!fs.existsSync(storeDir)) return ids;
  for (const cat of fs.readdirSync(storeDir)) {
    const catPath = path.join(storeDir, cat);
    if (!fs.statSync(catPath).isDirectory()) continue;
    for (const assetName of fs.readdirSync(catPath)) {
      const metaPath = path.join(catPath, assetName, 'meta.json');
      if (!fs.existsSync(metaPath)) continue;
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        if (meta.id) ids.add(meta.id);
      } catch { /* skip */ }
    }
  }
  return ids;
}

// ── readline 헬퍼 ─────────────────────────────────────────
function prompt(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function ask(rl, question, validate) {
  while (true) {
    const answer = (await prompt(rl, question)).trim();
    const error = validate ? validate(answer) : null;
    if (!error) return answer;
    console.error(`  ✗ ${error}`);
  }
}

// ── 메인 ─────────────────────────────────────────────────
async function main() {
  const ROOT = path.join(__dirname, '..');
  const STORE_DIR = path.join(ROOT, 'store');
  const existingIds = collectExistingIds(STORE_DIR);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n🛠  AI Asset Store — 새 asset 생성\n');

  // 타입
  const type = await ask(rl, '? 타입 (skill/rules/persona/prompt/workflow): ', v => {
    if (!TYPE_REGISTRY[v]) return `유효한 타입: ${Object.keys(TYPE_REGISTRY).join(', ')}`;
  });

  // ID
  const id = await ask(rl, '? Asset ID (소문자·숫자·하이픈, 예: react-code-review): ', v => {
    if (!/^[a-z0-9-]+$/.test(v)) return 'ID는 소문자·숫자·하이픈만 사용 가능합니다';
    if (existingIds.has(v)) return `"${v}"는 이미 존재하는 ID입니다`;
    if (!v) return 'ID를 입력하세요';
  });

  // 제목
  const title = await ask(rl, '? 제목: ', v => { if (!v) return '제목을 입력하세요'; });

  // 설명
  const description = await ask(rl, '? 설명 (2문장 이내): ', v => { if (!v) return '설명을 입력하세요'; });

  // 태그
  const tagsRaw = await ask(rl, '? 태그 (쉼표 구분, 예: python, review): ', v => { if (!v) return '태그를 1개 이상 입력하세요'; });
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

  // 도구
  const toolsKey = await ask(rl, '? 지원 도구 (1=cline, 2=cursor, 3=둘다): ', v => {
    if (!TOOLS_MAP[v]) return '1, 2, 3 중 하나를 입력하세요';
  });
  const tools = TOOLS_MAP[toolsKey];

  // 작성자
  const author = await ask(rl, '? 작성자 (이메일 또는 팀명): ', v => { if (!v) return '작성자를 입력하세요'; });

  // 미리보기
  const preview = await ask(rl, '? 미리보기 (200자 이내): ', v => {
    if (!v) return '미리보기를 입력하세요';
    if (v.length > 200) return `${v.length}자 입력됨 — 200자 이내로 줄여주세요`;
  });

  rl.close();

  // ── 파일 생성 ───────────────────────────────────────────
  console.log('');
  const { dir, file } = TYPE_REGISTRY[type];
  const assetDir = path.join(ROOT, dir, id);

  if (fs.existsSync(assetDir)) {
    console.error(`✗ 디렉토리가 이미 존재합니다: ${path.relative(ROOT, assetDir)}`);
    process.exit(1);
  }

  fs.mkdirSync(assetDir, { recursive: true });
  console.log(`✓ ${path.relative(ROOT, assetDir)}/ 생성`);

  // meta.json — $schema 경로는 루트까지의 상대 경로 (store/{type}/{id}/ → 3단계 위)
  const meta = {
    $schema: '../../../meta.schema.json',
    id,
    type,
    title,
    description,
    tags,
    tools,
    author,
    version: '1.0.0',
    updated: new Date().toISOString().slice(0, 10),
    file,
    preview,
  };
  fs.writeFileSync(path.join(assetDir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');
  console.log(`✓ ${path.relative(ROOT, path.join(assetDir, 'meta.json'))} 생성`);

  // body 파일
  fs.writeFileSync(path.join(assetDir, file), bodyTemplate(type, title), 'utf8');
  console.log(`✓ ${path.relative(ROOT, path.join(assetDir, file))} 생성 (템플릿)`);

  // ID 중복 최종 확인
  existingIds.add(id);
  console.log(`✓ ID 중복 검사 통과`);

  console.log(`
다음 단계:
  1. ${path.join(dir, id, file)} 내용 작성
  2. git add ${path.join(dir, id)}/
  3. git commit -m "feat: add ${id} ${type}"
  4. PR 제출
`);
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
