'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, Copy, ExternalLink, Newspaper, RotateCcw } from 'lucide-react';
import { StickyAlertDock } from '@/components/home/StickyAlertDock';
import { useAppState } from '@/context/AppStateContext';
import {
  buildAlertConditionSummary,
  buildDetailDisclosureItems,
  buildDetailedDiagnosisItems,
  buildDetailNewsItems,
  buildExternalLinkItems,
  buildNewsReactionSentence,
  buildOneLineWhySummary,
  buildSummaryChange,
  buildSummaryPrice,
} from '@/lib/cards/cardUiCopy';
import { buildConditionCopyViewModel } from '@/lib/cards/conditionCopy';
import { buildFrontCardViewModel } from '@/lib/cards/frontCardViewModel';
import { opendartSearchUrl, youtubeSearchUrl } from '@/lib/externalLinks';
import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

type BackSection = 'top' | 'news' | 'condition' | 'similar';

type StockCardBackProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
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
type ConditionPlatform = 'kiwoom' | 'tradingview';

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
  candidates,
  sameThemeCards,
  sameChartCards,
  initialSection = 'top',
  onShowFront,
}: StockCardBackProps) {
  const { copyFormula, logEvent, showToast } = useAppState();
  const [similarTab, setSimilarTab] = useState<SimilarTab>('chart');
  const [conditionPlatform, setConditionPlatform] = useState<ConditionPlatform>('kiwoom');
  const [floatDock, setFloatDock] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const newsRef = useRef<HTMLDivElement | null>(null);
  const conditionRef = useRef<HTMLDivElement | null>(null);
  const similarRef = useRef<HTMLDivElement | null>(null);

  const frontVm = useMemo(() => buildFrontCardViewModel(card, formula), [card, formula]);
  const oneLineSummary = frontVm.oneLineSummary;
  const facts = frontVm.facts.map((value) => ({ value }));
  const newsSentence = frontVm.newsSentence || buildNewsReactionSentence(card);
  const newsItems = useMemo(() => buildDetailNewsItems(card), [card]);
  const disclosureItems = useMemo(() => buildDetailDisclosureItems(card), [card]);
  const diagnosisItems = useMemo(() => buildDetailedDiagnosisItems(card), [card]);
  const alertSummary = useMemo(() => buildAlertConditionSummary(card, formula), [card, formula]);
  const conditionCopy = useMemo(() => buildConditionCopyViewModel(card, formula), [card, formula]);
  const externalLinks = useMemo(() => buildExternalLinkItems(card), [card]);
  const historyCards = useMemo(() => [...sameChartCards, ...sameThemeCards].filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index).slice(0, 4), [sameChartCards, sameThemeCards]);

  useEffect(() => {
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

  useEffect(() => {
    const updateDockMode = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportHeight = window.innerHeight;
      const hasEntered = rect.top < viewportHeight - 180;
      const hasRoomBeforeBottom = rect.bottom > viewportHeight + 220;
      setFloatDock(hasEntered && hasRoomBeforeBottom);
    };

    updateDockMode();
    window.addEventListener('scroll', updateDockMode, { passive: true });
    window.addEventListener('resize', updateDockMode);
    return () => {
      window.removeEventListener('scroll', updateDockMode);
      window.removeEventListener('resize', updateDockMode);
    };
  }, []);

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

  const copyCondition = async () => {
    const text = conditionPlatform === 'kiwoom' ? conditionCopy.kiwoomTemplate : conditionCopy.tradingViewTemplate;
    const eventName = conditionPlatform === 'kiwoom' ? 'copy_condition_kiwoom' : 'copy_condition_tradingview';
    logEvent(eventName, { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
    copyFormula(`${card.id}-${conditionPlatform}`, {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      platform: conditionPlatform,
      formulaKey: formula.key,
    });
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${conditionPlatform === 'kiwoom' ? '키움' : 'TradingView'} 복사용 템플릿을 복사했습니다.`);
    } catch {
      showToast('복사 권한이 없어 템플릿을 직접 선택해 복사해 주세요.');
    }
  };

  return (
    <section ref={containerRef} className="rounded-[30px] border border-slate-200 bg-white p-5 pb-6 shadow-[0_16px_36px_rgba(15,23,42,0.10)]">
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
        {facts.length ? (
          <div className={`mt-3 grid gap-2 ${facts.length === 1 ? 'grid-cols-1' : facts.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {facts.map((fact, index) => (
              <div key={`${fact.value}-${index}`} className="rounded-2xl bg-white px-3 py-2.5 text-[11px] font-black text-slate-700">
                {fact.value}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {floatDock ? (
        <StickyAlertDock
          card={card}
          formula={formula}
          candidates={candidates}
          alertSummary={alertSummary}
          floating
          onSimilar={() => {
            logEvent('similar_view_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'back_sticky' });
            setSimilarTab('chart');
            similarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          onDetailTop={() => {
            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      ) : null}

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
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#2563EB]" />
          <h3 className="text-sm font-black text-slate-950">알림 조건 / 조건식 복사</h3>
        </div>
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
          <p className="text-[11px] font-black text-blue-700">현재 추천 조건</p>
          <p className="mt-1 text-base font-black text-slate-950">{conditionCopy.conditionName}</p>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-slate-600">
            전고점 재시도 구간에서 거래대금과 수급이 같이 붙으면 다시 알려드립니다.
          </p>
        </div>

        <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
          {([
            ['kiwoom', '키움'],
            ['tradingview', 'TradingView'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setConditionPlatform(key)}
              className={`rounded-full px-4 py-2 text-[11px] font-black ${conditionPlatform === key ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-950 px-3 py-3 text-left">
          <p className="text-[11px] font-black text-blue-200">{conditionPlatform === 'kiwoom' ? '키움 조건식 복사용 템플릿' : 'TradingView 복사용 템플릿'}</p>
          <pre className="mt-2 max-h-44 overflow-hidden whitespace-pre-wrap text-[11px] font-semibold leading-5 text-slate-100">
            {conditionPlatform === 'kiwoom' ? conditionCopy.kiwoomTemplate : conditionCopy.tradingViewTemplate}
          </pre>
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">{conditionCopy.explanation}</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={copyCondition}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-xs font-black text-white"
          >
            <Copy className="h-4 w-4" />
            조건식 복사
          </button>
          <a
            href={`/alerts/browse?symbol=${encodeURIComponent(card.symbol)}&cardKey=${encodeURIComponent(card.id)}&formulaKey=${encodeURIComponent(formula.key)}`}
            onClick={() => logEvent('alert_browse_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'card_back_link' })}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-xs font-black text-slate-700"
          >
            <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />
            알람 둘러보기
          </a>
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

      {!floatDock ? (
        <div className="mt-5">
          <StickyAlertDock
            card={card}
            formula={formula}
            candidates={candidates}
            alertSummary={alertSummary}
            onSimilar={() => {
              logEvent('similar_view_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'back_inline' });
              setSimilarTab('chart');
              similarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            onDetailTop={() => {
              topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </div>
      ) : null}

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
