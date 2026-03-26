#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, '..', 'store');
const DIST_DIR = path.join(__dirname, '..', 'dist');

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

function buildCatalog() {
  const entries = findMetaFiles(STORE_DIR);
  const catalog = [];

  for (const { metaPath, category, assetName } of entries) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      meta.category = category;
      meta.zipPath = `zips/${assetName}.tar.gz`;
      catalog.push(meta);
    } catch (err) {
      console.error(`Failed to parse ${metaPath}:`, err.message);
    }
  }

  catalog.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));

  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

  const outPath = path.join(DIST_DIR, 'catalog.json');
  fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`catalog.json generated: ${catalog.length} assets → ${outPath}`);
}

buildCatalog();
