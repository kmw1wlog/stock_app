import 'server-only';

import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { alertEngineCatalog, pickRecommendedAlertEngine } from '@/lib/cards/alertEngineCatalog';
import { buildAlertConditionSummary, buildNewsReactionSentence } from '@/lib/cards/cardUiCopy';
import type { CardDetailData, FeedCardDisclosureItem, FeedCardNewsItem } from '@/lib/cards/cardDataContract';
import { opendartSearchUrl } from '@/lib/externalLinks';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import { fetchNaverNewsMentions } from '@/lib/providers/korea/naverNews';
import { fetchOpenDartRecentFilings } from '@/lib/providers/korea/openDart';
import type { DisplayCard } from '@/lib/marketDataTypes';

const defaultDartCorpCodes: Record<string, string> = {
  '005930': '00126380',
  '000660': '00164779',
  '005380': '00164742',
};

function stripMarkup(value?: string | null) {
  if (!value) return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function isoFromUnknown(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function buildNewsFallback(card: DisplayCard): FeedCardNewsItem[] {
  return [
    {
      title: `${card.name} 관련 뉴스 흐름`,
      source: 'Naver News',
      publishedAt: undefined,
      url: `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent([card.name, card.theme].filter(Boolean).join(' '))}`,
      summary: `${buildNewsReactionSentence(card)} 상태를 기사 검색으로 바로 확인할 수 있습니다.`,
      isFallback: true,
    },
  ];
}

function buildDisclosureFallback(card: DisplayCard): FeedCardDisclosureItem[] {
  return [
    {
      title: `${card.name} 공시 검색`,
      source: 'OpenDART',
      publishedAt: undefined,
      url: opendartSearchUrl(card.name, card.symbol),
      summary: '직접 공시 검색으로 최근 이벤트 유무를 확인할 수 있습니다.',
      isFallback: true,
    },
  ];
}

async function findDartCorpCode(card: DisplayCard) {
  if (hasDatabaseUrl()) {
    const asset = await prisma.asset.findUnique({
      where: { market_symbol: { market: card.market, symbol: card.symbol } },
      select: { dartCorpCode: true },
    });
    if (asset?.dartCorpCode) return asset.dartCorpCode;
  }
  return defaultDartCorpCodes[card.symbol];
}

async function loadNews(card: DisplayCard): Promise<{ source: CardDetailData['providers']['news']; items: FeedCardNewsItem[] }> {
  if (hasDatabaseUrl()) {
    const asset = await prisma.asset.findUnique({
      where: { market_symbol: { market: card.market, symbol: card.symbol } },
      select: { id: true },
    });
    if (asset?.id) {
      const mentions = await prisma.newsMention.findMany({
        where: { assetId: asset.id },
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { title: true, outlet: true, link: true, publishedAt: true, raw: true },
      });
      if (mentions.length) {
        const items = mentions.map((item) => ({
          title: stripMarkup(item.title) || `${card.name} 관련 뉴스`,
          source: item.outlet || 'Naver News',
          publishedAt: item.publishedAt?.toISOString(),
          url: item.link || undefined,
          summary: `${buildNewsReactionSentence(card)} 흐름과 함께 확인된 뉴스입니다.`,
          isFallback: false,
        }));
        return { source: 'db', items };
      }
    }
  }

  const query = [card.name, card.theme].filter(Boolean).join(' ') || card.symbol;
  const result = await fetchNaverNewsMentions(query);
  const items = result.data
    .slice(0, 3)
    .map((item) => ({
      title: stripMarkup(item.title) || `${card.name} 관련 뉴스`,
      source: 'Naver News',
      publishedAt: isoFromUnknown(item.pubDate),
      url: item.originallink || item.link || undefined,
      summary: stripMarkup(item.description) || `${buildNewsReactionSentence(card)} 흐름을 함께 보고 있습니다.`,
      isFallback: false,
    }))
    .filter((item) => item.title);

  if (items.length) return { source: 'api', items };
  return { source: 'fallback', items: buildNewsFallback(card) };
}

async function loadDisclosures(card: DisplayCard): Promise<{ source: CardDetailData['providers']['disclosures']; items: FeedCardDisclosureItem[] }> {
  const corpCode = await findDartCorpCode(card);
  if (!corpCode) {
    return { source: 'fallback', items: buildDisclosureFallback(card) };
  }

  const result = await fetchOpenDartRecentFilings(corpCode);
  const items = result.data
    .slice(0, 3)
    .map((item) => {
      const row = item as { report_nm?: unknown; rcp_no?: unknown; rcept_no?: unknown; flr_nm?: unknown; rcept_dt?: unknown };
      const receiptNo = typeof row.rcept_no === 'string' ? row.rcept_no : typeof row.rcp_no === 'string' ? row.rcp_no : undefined;
      return {
        title: stripMarkup(typeof row.report_nm === 'string' ? row.report_nm : `${card.name} 최근 공시`) || `${card.name} 최근 공시`,
        source: 'OpenDART' as const,
        publishedAt: typeof row.rcept_dt === 'string' && row.rcept_dt.length === 8
          ? `${row.rcept_dt.slice(0, 4)}-${row.rcept_dt.slice(4, 6)}-${row.rcept_dt.slice(6, 8)}T00:00:00.000Z`
          : undefined,
        url: receiptNo ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receiptNo}` : opendartSearchUrl(card.name, card.symbol),
        summary: typeof row.flr_nm === 'string' ? `${row.flr_nm} 공시 원문으로 이동합니다.` : '최근 공시와 이벤트를 원문으로 확인할 수 있습니다.',
        isFallback: false,
      };
    })
    .filter((item) => item.title);

  if (items.length) return { source: 'api', items };
  return { source: 'fallback', items: buildDisclosureFallback(card) };
}

function isEngineApplicable(card: DisplayCard, engineKey: string) {
  if (engineKey === 'H_risk_watch' || engineKey === 'O_limit_up_watch') return typeof card.changePct === 'number';
  if (/B_|C_|D_|E_|K_/.test(engineKey)) return Boolean(card.chartSetupType || typeof card.changePct === 'number');
  return Boolean(card.amount || card.volume || card.theme || typeof card.changePct === 'number');
}

export async function buildCardDetailData(card: DisplayCard, formula: FormulaDefinition): Promise<CardDetailData> {
  const [news, disclosures] = await Promise.all([loadNews(card), loadDisclosures(card)]);
  const recommended = pickRecommendedAlertEngine(formula.key);
  return {
    symbol: card.symbol,
    name: card.name,
    market: card.market,
    theme: card.theme,
    providers: {
      news: news.source,
      disclosures: disclosures.source,
    },
    news: news.items,
    disclosures: disclosures.items,
    alert: {
      recommendedKey: recommended.key,
      recommendedName: recommended.name,
      displayCondition: buildAlertConditionSummary(card, formula),
      engines: alertEngineCatalog.map((engine) => ({
        code: engine.code,
        key: engine.key,
        name: engine.name,
        description: engine.summary,
        easyRule: engine.easyRule,
        applicable: isEngineApplicable(card, engine.key),
        recommended: engine.key === recommended.key,
      })),
    },
  };
}
