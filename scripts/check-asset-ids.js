#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, '..', 'store');

function findMetaFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const category of fs.readdirSync(dir)) {
    const categoryPath = path.join(dir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    for (const assetName of fs.readdirSync(categoryPath)) {
      const assetPath = path.join(categoryPath, assetName);
      if (!fs.statSync(assetPath).isDirectory()) continue;

      const metaPath = path.join(assetPath, 'meta.json');
      if (fs.existsSync(metaPath)) {
        results.push({ metaPath, category, assetName });
      }
    }
  }
  return results;
}

const entries = findMetaFiles(STORE_DIR);
const seen = new Map(); // id → 처음 등장한 파일 경로
const duplicates = [];
const errors = [];

for (const { metaPath } of entries) {
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch (err) {
    errors.push(`[ERROR] JSON 파싱 실패: ${metaPath}\n  ${err.message}`);
    continue;
  }

  if (!meta.id) {
    errors.push(`[ERROR] id 필드 없음: ${metaPath}`);
    continue;
  }

  if (seen.has(meta.id)) {
    duplicates.push({ id: meta.id, first: seen.get(meta.id), second: metaPath });
  } else {
    seen.set(meta.id, metaPath);
  }
}

if (errors.length > 0) {
  console.error('=== 오류 발견 ===');
  for (const msg of errors) console.error(msg);
}

if (duplicates.length > 0) {
  console.error('\n=== 중복된 asset ID 발견 ===');
  for (const { id, first, second } of duplicates) {
    console.error(`\nID: "${id}"`);
    console.error(`  - ${first}`);
    console.error(`  - ${second}`);
  }
}

if (errors.length > 0 || duplicates.length > 0) {
  process.exit(1);
}

console.log(`[OK] 중복 없음. 총 ${seen.size}개 asset ID 확인 완료.`);
