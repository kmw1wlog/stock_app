import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const krAssets = [
  ['005930', '삼성전자', '반도체', 'KRX:005930', '00126380'],
  ['000660', 'SK하이닉스', '반도체', 'KRX:000660', '00164779'],
  ['373220', 'LG에너지솔루션', '2차전지', 'KRX:373220', undefined],
  ['207940', '삼성바이오로직스', '바이오', 'KRX:207940', undefined],
  ['005380', '현대차', '자동차', 'KRX:005380', '00164742'],
  ['000270', '기아', '자동차', 'KRX:000270', '00106641'],
  ['068270', '셀트리온', '바이오', 'KRX:068270', undefined],
  ['035420', 'NAVER', '인터넷', 'KRX:035420', undefined],
  ['035720', '카카오', '인터넷', 'KRX:035720', undefined],
  ['005490', 'POSCO홀딩스', '철강', 'KRX:005490', '00155319'],
  ['028260', '삼성물산', '지주', 'KRX:028260', undefined],
  ['105560', 'KB금융', '금융', 'KRX:105560', undefined],
  ['055550', '신한지주', '금융', 'KRX:055550', undefined],
  ['012330', '현대모비스', '자동차', 'KRX:012330', undefined],
  ['066570', 'LG전자', '전기전자', 'KRX:066570', '00401731'],
  ['051910', 'LG화학', '화학', 'KRX:051910', '00356370'],
  ['096770', 'SK이노베이션', '에너지', 'KRX:096770', undefined],
  ['003670', '포스코퓨처엠', '2차전지', 'KRX:003670', undefined],
  ['277810', '레인보우로보틱스', '로봇', 'KRX:277810', undefined],
  ['247540', '에코프로비엠', '2차전지', 'KRX:247540', undefined],
] as const;

const usAssets = [
  ['AAPL', 'Apple', 'M7', 'NASDAQ:AAPL', '0000320193'],
  ['MSFT', 'Microsoft', 'M7', 'NASDAQ:MSFT', '0000789019'],
  ['NVDA', 'NVIDIA', 'AI·반도체', 'NASDAQ:NVDA', '0001045810'],
  ['AMZN', 'Amazon', 'M7', 'NASDAQ:AMZN', '0001018724'],
  ['GOOGL', 'Alphabet Class A', 'M7', 'NASDAQ:GOOGL', '0001652044'],
  ['META', 'Meta Platforms', 'M7', 'NASDAQ:META', '0001326801'],
  ['TSLA', 'Tesla', '전기차', 'NASDAQ:TSLA', '0001318605'],
  ['AVGO', 'Broadcom', '반도체', 'NASDAQ:AVGO', '0001730168'],
  ['AMD', 'AMD', '반도체', 'NASDAQ:AMD', '0000002488'],
  ['NFLX', 'Netflix', '미디어', 'NASDAQ:NFLX', '0001065280'],
  ['JPM', 'JPMorgan Chase', '금융', 'NYSE:JPM', '0000019617'],
  ['V', 'Visa', '결제', 'NYSE:V', '0001403161'],
  ['MA', 'Mastercard', '결제', 'NYSE:MA', '0001141391'],
  ['LLY', 'Eli Lilly', '헬스케어', 'NYSE:LLY', '0000059478'],
  ['UNH', 'UnitedHealth', '헬스케어', 'NYSE:UNH', '0000731766'],
  ['XOM', 'Exxon Mobil', '에너지', 'NYSE:XOM', '0000034088'],
  ['COST', 'Costco', '소비재', 'NASDAQ:COST', '0000909832'],
  ['ORCL', 'Oracle', '소프트웨어', 'NYSE:ORCL', '0001341439'],
  ['CRM', 'Salesforce', '소프트웨어', 'NYSE:CRM', '0001108524'],
  ['PLTR', 'Palantir', 'AI', 'NASDAQ:PLTR', '0001321655'],
] as const;

const cryptoAssets = [
  ['BTC', 'Bitcoin', '대형코인', 'BINANCE:BTCUSDT', 'bitcoin', '1', 'BTCUSDT', 'KRW-BTC'],
  ['ETH', 'Ethereum', '대형코인', 'BINANCE:ETHUSDT', 'ethereum', '1027', 'ETHUSDT', 'KRW-ETH'],
  ['SOL', 'Solana', 'L1', 'BINANCE:SOLUSDT', 'solana', '5426', 'SOLUSDT', 'KRW-SOL'],
  ['XRP', 'XRP', '결제', 'BINANCE:XRPUSDT', 'ripple', '52', 'XRPUSDT', 'KRW-XRP'],
  ['BNB', 'BNB', '거래소', 'BINANCE:BNBUSDT', 'binancecoin', '1839', 'BNBUSDT', undefined],
  ['DOGE', 'Dogecoin', '밈', 'BINANCE:DOGEUSDT', 'dogecoin', '74', 'DOGEUSDT', 'KRW-DOGE'],
  ['ADA', 'Cardano', 'L1', 'BINANCE:ADAUSDT', 'cardano', '2010', 'ADAUSDT', 'KRW-ADA'],
  ['AVAX', 'Avalanche', 'L1', 'BINANCE:AVAXUSDT', 'avalanche-2', '5805', 'AVAXUSDT', 'KRW-AVAX'],
  ['LINK', 'Chainlink', '오라클', 'BINANCE:LINKUSDT', 'chainlink', '1975', 'LINKUSDT', 'KRW-LINK'],
  ['TRX', 'TRON', 'L1', 'BINANCE:TRXUSDT', 'tron', '1958', 'TRXUSDT', 'KRW-TRX'],
  ['DOT', 'Polkadot', 'L1', 'BINANCE:DOTUSDT', 'polkadot', '6636', 'DOTUSDT', 'KRW-DOT'],
  ['MATIC', 'Polygon', 'L2', 'BINANCE:MATICUSDT', 'matic-network', '3890', 'MATICUSDT', 'KRW-MATIC'],
  ['BCH', 'Bitcoin Cash', '대형코인', 'BINANCE:BCHUSDT', 'bitcoin-cash', '1831', 'BCHUSDT', 'KRW-BCH'],
  ['LTC', 'Litecoin', '대형코인', 'BINANCE:LTCUSDT', 'litecoin', '2', 'LTCUSDT', 'KRW-LTC'],
  ['ATOM', 'Cosmos', 'L1', 'BINANCE:ATOMUSDT', 'cosmos', '3794', 'ATOMUSDT', 'KRW-ATOM'],
  ['APT', 'Aptos', 'L1', 'BINANCE:APTUSDT', 'aptos', '21794', 'APTUSDT', undefined],
  ['ARB', 'Arbitrum', 'L2', 'BINANCE:ARBUSDT', 'arbitrum', '11841', 'ARBUSDT', undefined],
  ['OP', 'Optimism', 'L2', 'BINANCE:OPUSDT', 'optimism', '11840', 'OPUSDT', undefined],
  ['NEAR', 'NEAR Protocol', 'L1', 'BINANCE:NEARUSDT', 'near', '6535', 'NEARUSDT', 'KRW-NEAR'],
  ['SUI', 'Sui', 'L1', 'BINANCE:SUIUSDT', 'sui', '20947', 'SUIUSDT', undefined],
] as const;

async function main() {
  for (const [symbol, name, theme, tvSymbol, dartCorpCode] of krAssets) {
    await prisma.asset.upsert({ where: { market_symbol: { market: 'KR', symbol } }, update: { name, exchange: 'KRX', theme, tvSymbol, dataGoKrCode: symbol, dartCorpCode }, create: { market: 'KR', symbol, name, exchange: 'KRX', theme, tvSymbol, dataGoKrCode: symbol, dartCorpCode } });
  }
  for (const [symbol, name, theme, tvSymbol, cik] of usAssets) {
    await prisma.asset.upsert({ where: { market_symbol: { market: 'US', symbol } }, update: { name, exchange: tvSymbol.split(':')[0], theme, tvSymbol, cik }, create: { market: 'US', symbol, name, exchange: tvSymbol.split(':')[0], theme, tvSymbol, cik } });
  }
  for (const [symbol, name, theme, tvSymbol, coingeckoId, cmcId, binanceSymbol, upbitMarket] of cryptoAssets) {
    await prisma.asset.upsert({ where: { market_symbol: { market: 'CRYPTO', symbol } }, update: { name, exchange: 'Binance/Upbit', theme, tvSymbol, coingeckoId, cmcId, binanceSymbol, upbitMarket }, create: { market: 'CRYPTO', symbol, name, exchange: 'Binance/Upbit', theme, tvSymbol, coingeckoId, cmcId, binanceSymbol, upbitMarket } });
  }
}

main().finally(async () => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
