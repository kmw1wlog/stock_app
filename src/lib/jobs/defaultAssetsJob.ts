import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';

const defaultAssets = [
  { market: 'KR', symbol: '005930', name: '삼성전자', exchange: 'KRX', theme: '반도체', tvSymbol: 'KRX:005930', dataGoKrCode: '005930', dartCorpCode: '00126380' },
  { market: 'KR', symbol: '000660', name: 'SK하이닉스', exchange: 'KRX', theme: '반도체', tvSymbol: 'KRX:000660', dataGoKrCode: '000660', dartCorpCode: '00164779' },
  { market: 'KR', symbol: '035420', name: 'NAVER', exchange: 'KRX', theme: '인터넷', tvSymbol: 'KRX:035420', dataGoKrCode: '035420' },
  { market: 'KR', symbol: '005380', name: '현대차', exchange: 'KRX', theme: '자동차', tvSymbol: 'KRX:005380', dataGoKrCode: '005380', dartCorpCode: '00164742' },
  { market: 'KR', symbol: '277810', name: '레인보우로보틱스', exchange: 'KRX', theme: '로봇', tvSymbol: 'KRX:277810', dataGoKrCode: '277810' },
  { market: 'US', symbol: 'AAPL', name: 'Apple', exchange: 'NASDAQ', theme: 'M7', tvSymbol: 'NASDAQ:AAPL', cik: '0000320193' },
  { market: 'US', symbol: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ', theme: 'M7', tvSymbol: 'NASDAQ:MSFT', cik: '0000789019' },
  { market: 'US', symbol: 'NVDA', name: 'NVIDIA', exchange: 'NASDAQ', theme: 'AI·반도체', tvSymbol: 'NASDAQ:NVDA', cik: '0001045810' },
  { market: 'US', symbol: 'TSLA', name: 'Tesla', exchange: 'NASDAQ', theme: '전기차', tvSymbol: 'NASDAQ:TSLA', cik: '0001318605' },
  { market: 'CRYPTO', symbol: 'BTC', name: 'Bitcoin', exchange: 'Binance/Upbit', theme: '대형코인', tvSymbol: 'BINANCE:BTCUSDT', coingeckoId: 'bitcoin', cmcId: '1', binanceSymbol: 'BTCUSDT', upbitMarket: 'KRW-BTC' },
  { market: 'CRYPTO', symbol: 'ETH', name: 'Ethereum', exchange: 'Binance/Upbit', theme: '대형코인', tvSymbol: 'BINANCE:ETHUSDT', coingeckoId: 'ethereum', cmcId: '1027', binanceSymbol: 'ETHUSDT', upbitMarket: 'KRW-ETH' },
  { market: 'CRYPTO', symbol: 'SOL', name: 'Solana', exchange: 'Binance/Upbit', theme: 'L1', tvSymbol: 'BINANCE:SOLUSDT', coingeckoId: 'solana', cmcId: '5426', binanceSymbol: 'SOLUSDT', upbitMarket: 'KRW-SOL' },
  { market: 'CRYPTO', symbol: 'XRP', name: 'XRP', exchange: 'Binance/Upbit', theme: '결제', tvSymbol: 'BINANCE:XRPUSDT', coingeckoId: 'ripple', cmcId: '52', binanceSymbol: 'XRPUSDT', upbitMarket: 'KRW-XRP' },
];

export async function defaultAssetsJob(): Promise<JobResult> {
  const startedAt = startJob();
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'default-assets', ok: false, provider: 'db', startedAt, fetched: defaultAssets.length, normalized: defaultAssets.length, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  let saved = 0;
  for (const asset of defaultAssets) {
    await prisma.asset.upsert({
      where: { market_symbol: { market: asset.market, symbol: asset.symbol } },
      create: asset,
      update: asset,
    });
    saved += 1;
  }

  return finishJob({ jobName: 'default-assets', ok: true, provider: 'db', startedAt, fetched: defaultAssets.length, normalized: defaultAssets.length, saved, skipped: 0, failed: 0, missingEnv: [], errors: [] });
}
