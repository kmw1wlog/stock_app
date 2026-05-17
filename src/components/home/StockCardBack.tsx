'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bell, Copy, ExternalLink, Info, Newspaper, RotateCcw } from 'lucide-react';
import { ConditionAlertButton } from '@/components/alerts/ConditionAlertButton';
import { useAppState } from '@/context/AppStateContext';
import {
  buildAlertConditionSummary,
  buildConditionCopy,
  buildDetailDisclosureItems,
  buildDetailedDiagnosisItems,
  buildDetailNewsItems,
  buildExternalLinkItems,
  buildFrontFacts,
  buildNewsReactionSentence,
  buildOneLineWhySummary,
  buildSummaryChange,
  buildSummaryPrice,
} from '@/lib/cards/cardUiCopy';
import { opendartSearchUrl, xSearchUrl, youtubeSearchUrl } from '@/lib/externalLinks';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

type BackSection = 'top' | 'news' | 'condition' | 'similar';

type StockCardBackProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  sameThemeCards: DisplayCard[];
  sameChartCards: DisplayCard[];
  initialSection?: BackSection;
  onShowFront: () => void;
};

const diagnosisTone = {
  good: 'border-blue-200 bg-blue-50 text-blue-700',
  neutral: 'border-slate-200 bg-white text-slate-700',
  caution: 'border-amber-200 bg-amber-50 text-amber-700',
} as const;

type SimilarTab = 'chart' | 'theme' | 'history';

function SimilarItem({ card }: { card: DisplayCard }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">{card.name}</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">{card.symbol} · {card.marketLabel}</p>
        </div>
        <p className={`text-[12px] font-black ${(card.changePct ?? 0) < 0 ? 'text-blue-600' : 'text-rose-500'}`}>
          {typeof card.changePct === 'number' ? `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(1)}%` : '관찰'}
        </p>
      </div>
      <p className="mt-2 line-clamp-2 text-[12px] font-semibold leading-5 text-slate-600">{buildOneLineWhySummary(card)}</p>
    </div>
  );
}

export function StockCardBack({
  card,
  formula,
  sameThemeCards,
  sameChartCards,
  initialSection = 'top',
  onShowFront,
}: StockCardBackProps) {
  const { logEvent, copyFormula, showToast } = useAppState();
  const [copyTab, setCopyTab] = useState<'kiwoom' | 'tradingview'>('kiwoom');
  const [similarTab, setSimilarTab] = useState<SimilarTab>('chart');
  const topRef = useRef<HTMLDivElement | null>(null);
  const newsRef = useRef<HTMLDivElement | null>(null);
  const conditionRef = useRef<HTMLDivElement | null>(null);
  const similarRef = useRef<HTMLDivElement | null>(null);

  const oneLineSummary = useMemo(() => buildOneLineWhySummary(card), [card]);
  const facts = useMemo(() => buildFrontFacts(card), [card]);
  const newsSentence = useMemo(() => buildNewsReactionSentence(card), [card]);
  const newsItems = useMemo(() => buildDetailNewsItems(card), [card]);
  const disclosureItems = useMemo(() => buildDetailDisclosureItems(card), [card]);
  const diagnosisItems = useMemo(() => buildDetailedDiagnosisItems(card), [card]);
  const alertSummary = useMemo(() => buildAlertConditionSummary(card, formula), [card, formula]);
  const externalLinks = useMemo(() => buildExternalLinkItems(card), [card]);
  const historyCards = useMemo(() => [...sameChartCards, ...sameThemeCards].filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 4), [sameChartCards, sameThemeCards]);

  useEffect(() => {
    setCopyTab('kiwoom');
    setSimilarTab(initialSection === 'similar' ? 'chart' : 'chart');

    const mapping: Record<BackSection, React.RefObject<HTMLDivElement | null>> = {
      top: topRef,
      news: newsRef,
      condition: conditionRef,
      similar: similarRef,
    };
    requestAnimationFrame(() => {
      mapping[initialSection].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [initialSection]);

  const onCopyCondition = async (platform: 'kiwoom' | 'tradingview') => {
    const text = buildConditionCopy(card, formula, platform);
    await navigator.clipboard.writeText(text).catch(() => undefined);
    copyFormula(`${card.id}-${formula.key}-${platform}`, {
      cardKey: card.id,
      assetKey: card.assetKey,
      symbol: card.symbol,
      market: card.market,
      formulaKey: formula.key,
      platform,
    });
    logEvent(platform === 'kiwoom' ? 'copy_condition_kiwoom' : 'copy_condition_tradingview', {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      formulaKey: formula.key,
    });
    showToast(platform === 'kiwoom' ? '키움 조건식을 복사했습니다.' : 'TradingView 조건식을 복사했습니다.');
  };

  const onExternalClick = (key: 'mts' | 'opendart' | 'youtube' | 'x', href?: string) => {
    if (key === 'mts') {
      logEvent('external_mts_click', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'card_back' });
      const params = new URLSearchParams({
        cardKey: card.id,
        assetKey: card.assetKey,
        symbol: card.symbol,
        name: card.name,
        source: 'card_back',
      });
      window.location.assign(`/mts/select?${params.toString()}`);
      return;
    }

    logEvent(
      key === 'opendart' ? 'external_opendart_click' : key === 'youtube' ? 'external_youtube_click' : 'external_x_click',
      { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'card_back' },
    );
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.10)]">
      <div ref={topRef} className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            logEvent('card_detail_close', { cardKey: card.id, symbol: card.symbol, market: card.market });
            onShowFront();
          }}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          앞면
        </button>
        <p className="text-xs font-black text-[#2563EB]">상세</p>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[28px] font-black text-slate-950">{card.name}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{card.symbol}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[20px] font-black text-slate-950">{buildSummaryPrice(card)}</p>
            <p className={`mt-1 text-sm font-black ${(card.changePct ?? 0) < 0 ? 'text-blue-600' : 'text-rose-500'}`}>{buildSummaryChange(card)}</p>
          </div>
        </div>
        <p className="mt-3 text-[15px] font-black leading-6 text-slate-950">{oneLineSummary}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {facts.map((fact, index) => (
            <div key={`${fact.value}-${index}`} className="rounded-2xl bg-white px-3 py-2.5 text-[11px] font-black text-slate-700">
              {fact.value}
            </div>
          ))}
        </div>
      </div>

      <section ref={newsRef} className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-[#2563EB]" />
          <h3 className="text-sm font-black text-slate-950">뉴스·공시·반응 이유</h3>
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{newsSentence}.</p>
        <div className="mt-4 space-y-3">
          {newsItems.map((item) => (
            <a
              key={`${item.title}-${item.source}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => logEvent('card_news_source_click', { cardKey: card.id, symbol: card.symbol, market: card.market, source: item.source })}
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.source} · {item.timeLabel}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-slate-600">{item.summary}</p>
            </a>
          ))}
        </div>
        <div className="mt-3 space-y-3">
          {disclosureItems.map((item) => (
            <a
              key={`${item.title}-${item.source}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => logEvent('card_opendart_click', { cardKey: card.id, symbol: card.symbol, market: card.market })}
              className="block rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{item.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.source} · {item.timeLabel}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-slate-600">{item.summary}</p>
            </a>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <a href={newsItems[0]?.href ?? youtubeSearchUrl(card.name)} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700">
            뉴스 더 보기
          </a>
          <a href={opendartSearchUrl(card.name, card.symbol)} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700">
            OpenDART 보기
          </a>
        </div>
      </section>

      <section ref={conditionRef} className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-black text-slate-950">알림 조건 / 조건식 복사</h3>
        <p className="mt-3 text-base font-black text-slate-950">{alertSummary}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">전고점 재시도 구간에서 거래대금과 수급이 같이 붙으면 다시 알려드립니다.</p>
        <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
          {(['kiwoom', 'tradingview'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setCopyTab(tab);
                logEvent('alert_condition_explain_open', { cardKey: card.id, symbol: card.symbol, market: card.market, platform: tab });
              }}
              className={`rounded-full px-3 py-2 text-xs font-black ${copyTab === tab ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500'}`}
            >
              {tab === 'kiwoom' ? '키움' : 'TradingView'}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-black text-slate-500">{copyTab === 'kiwoom' ? '키움 조건식' : 'TradingView 조건식'}</p>
          <pre className="mt-2 whitespace-pre-wrap break-words text-[12px] font-semibold leading-5 text-slate-700">{buildConditionCopy(card, formula, copyTab)}</pre>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onCopyCondition(copyTab)}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#2563EB] bg-white text-sm font-black text-[#2563EB]"
          >
            <Copy className="h-4 w-4" />
            {copyTab === 'kiwoom' ? '키움 조건식 복사' : 'TradingView 복사'}
          </button>
          <ConditionAlertButton card={card} formula={formula} className="w-full" label="이 조건으로 알림 받기" />
          <button
            type="button"
            onClick={() => {
              logEvent('similar_view_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'back_cta' });
              setSimilarTab('chart');
              similarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
          >
            유사 종목 더 보기
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-black text-slate-950">종목진단 상세</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {diagnosisItems.map((item) => (
            <div key={item.label} className={`rounded-2xl border px-3 py-3 ${diagnosisTone[item.tone]}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-black opacity-80">{item.label}</p>
                <p className="text-[12px] font-black">{item.value}</p>
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-5">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={similarRef} className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-black text-slate-950">유사 보기</h3>
        <div className="mt-3 inline-flex rounded-full bg-slate-100 p-1">
          {([
            ['chart', '같은 차트자리 종목'],
            ['theme', '같은 테마 종목'],
            ['history', '비슷한 반응 과거 사례'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSimilarTab(key);
                logEvent('similar_tab_select', { cardKey: card.id, symbol: card.symbol, market: card.market, tab: key });
              }}
              className={`rounded-full px-3 py-2 text-[11px] font-black ${similarTab === key ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {(similarTab === 'chart' ? sameChartCards : similarTab === 'theme' ? sameThemeCards : historyCards).slice(0, 4).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => logEvent('similar_card_click', { cardKey: card.id, targetCardKey: item.id, symbol: item.symbol, market: item.market, tab: similarTab })}
              className="text-left"
            >
              <SimilarItem card={item} />
            </button>
          ))}
          {!((similarTab === 'chart' ? sameChartCards : similarTab === 'theme' ? sameThemeCards : historyCards).length) ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs font-semibold text-slate-500">
              아직 바로 보여줄 비교 카드가 없습니다.
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-black text-slate-950">외부 바로가기</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {externalLinks.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onExternalClick(item.key, item.href)}
              className="flex min-h-14 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-950"
            >
              {item.label}
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ConditionAlertButton card={card} formula={formula} className="w-full" label="이 조건으로 알림 받기" />
        <button
          type="button"
          onClick={() => onCopyCondition(copyTab)}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
        >
          <Copy className="h-4 w-4" />
          조건식 복사
        </button>
        <button
          type="button"
          onClick={() => {
            setSimilarTab('chart');
            similarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
        >
          유사 종목 더 보기
        </button>
        <Link
          href={`/cards/${card.id}/formula`}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2563EB] text-sm font-black text-white"
        >
          <Info className="h-4 w-4" />
          조건 상세 보기
        </Link>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            logEvent('card_detail_close', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'back_button' });
            onShowFront();
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          앞면으로 돌아가기
        </button>
      </div>
    </section>
  );
}
