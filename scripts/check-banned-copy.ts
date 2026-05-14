import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src/app', 'src/components', 'src/lib', 'src/context'];
const banned = [
  '프리미엄',
  'PremiumLockCard',
  '무료 TOP 3',
  'TOP 30',
  '남들이',
  '상위 사용자',
  '저장률',
  '조건식까지 확인한 사용자',
  '놓친 카드',
  '수익권',
  '가상추적',
  'premium_lock_view',
  'premium_lock_click',
  '지금 거래하기',
  '매수하러',
  '매수 추천',
  '진입 타이밍',
  '급등 확정',
  '수익 보장',
  '세력 포착',
  '무조건 오른다',
  '상한가 확정',
  '오늘 상한가',
  '추천 매수',
  '수익 기회',
  '놓치면 후회',
  '자동매매',
  '증권사 API 주문',
  '리딩방 광고',
  '실제 매수 발생당 과금',
  '거래대금 비례 과금',
  '다른 MTS 알림 감지',
];
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
