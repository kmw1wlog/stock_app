import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { buildFrontRuntimeCards } from '@/lib/cards/frontFeedRuntime';

function loadDotEnv(filePath: string) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main() {
  loadDotEnv('.env');
  loadDotEnv('.env.local');

  const cards = await buildFrontRuntimeCards(5);
  const frontendDir = path.join(process.cwd(), 'runtime_output', 'realtime_signals', 'frontend');
  await mkdir(frontendDir, { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'front-runtime-builder',
    items: cards,
    cards,
  };
  const outputPath = path.join(frontendDir, 'front-feed.json');
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ok: true, outputPath, count: cards.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
