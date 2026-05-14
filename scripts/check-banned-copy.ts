import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src/app', 'src/components', 'src/lib', 'src/context'];
const banned = ['프리미엄', 'PremiumLockCard', '무료 TOP 3', '상위 사용자', '남들이', '저장률', '조건식까지 확인한 사용자', '놓친 카드', '수익권', '가상추적', 'premium_lock_view', 'premium_lock_click'];
const allowedFiles = new Set<string>();
const hits: Array<{ file: string; word: string; line: number }> = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(path) || allowedFiles.has(path)) continue;
    const lines = readFileSync(path, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const word of banned) {
        if (line.includes(word)) hits.push({ file: path, word, line: index + 1 });
      }
    });
  }
}

roots.forEach(walk);
console.log(JSON.stringify({ ok: hits.length === 0, hits }, null, 2));
if (hits.length) process.exit(1);
