'use client';

import { X } from 'lucide-react';
import type { FormulaCandidate } from '@/lib/formulas/formulaCatalog';

type FormulaCandidateSheetProps = {
  open: boolean;
  candidates: FormulaCandidate[];
  onClose: () => void;
  onSelect: (candidate: FormulaCandidate) => void;
};

const fitTone: Record<FormulaCandidate['fitLabel'], string> = {
  '지금 가장 잘 맞음': 'bg-blue-50 text-[#0B63F6]',
  관찰용: 'bg-slate-100 text-slate-700',
  '조건 부족': 'bg-amber-50 text-amber-700',
  '위험 감시': 'bg-rose-50 text-rose-700',
};

export function FormulaCandidateSheet({ open, candidates, onClose, onSelect }: FormulaCandidateSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/45 px-4 pb-4">
      <section className="max-h-[82dvh] w-full max-w-[430px] overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#0B63F6]">다른 조건식 추천</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">이 종목에 적용 가능한 조건식</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {candidates.map((candidate) => (
            <button
              key={candidate.formula.key}
              type="button"
              onClick={() => onSelect(candidate)}
              className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-slate-950">{candidate.formula.name}</p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">{candidate.formula.userIntent}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${fitTone[candidate.fitLabel]}`}>{candidate.fitLabel}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {candidate.matchedReasons.slice(0, 3).map((reason) => (
                  <span key={reason} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {reason}
                  </span>
                ))}
              </div>
              {candidate.missingReasons?.length ? (
                <p className="mt-3 text-xs font-semibold leading-5 text-amber-700">부족한 기준: {candidate.missingReasons.join(' · ')}</p>
              ) : null}
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs font-semibold leading-5 text-slate-500">
          조건식은 조건 충족 사실을 다시 확인하기 위한 참고 기준이며 매수·매도 추천이 아닙니다.
        </p>
      </section>
    </div>
  );
}
