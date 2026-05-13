import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const assets = [
    {
      market: 'KR',
      symbol: '277810',
      name: '레인보우로보틱스',
      exchange: 'KRX',
      theme: '로봇',
      tvSymbol: 'KRX:277810',
      dataGoKrCode: '277810',
    },
    {
      market: 'US',
      symbol: 'AAPL',
      name: 'Apple',
      exchange: 'NASDAQ',
      theme: 'M7',
      tvSymbol: 'NASDAQ:AAPL',
      cik: '0000320193',
    },
    {
      market: 'CRYPTO',
      symbol: 'BTC',
      name: 'Bitcoin',
      exchange: 'Binance',
      theme: '대형 코인',
      tvSymbol: 'BINANCE:BTCUSDT',
      coingeckoId: 'bitcoin',
      cmcId: '1',
      binanceSymbol: 'BTCUSDT',
      upbitMarket: 'KRW-BTC',
    },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { market_symbol: { market: asset.market, symbol: asset.symbol } },
      update: asset,
      create: asset,
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
