'use client';

import { FormEvent, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

const examples = [
  '환율 얼마야?',
  '미장 살 때 환율도 봐야 해?',
  '지금 반도체 테마에서 뭐가 제일 강해?',
  '이 조건으로 알림을 더 만들 수 있어?',
  '내 관심종목 중 위험한 종목 있어?',
];

export function ForYouAiClient() {
  const { logEvent } = useAppState();
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = question.trim();
    if (!normalized) return;
    logEvent('ai_question_submit', { question: normalized, source: 'for_you_ai_page' });
    setSubmitted(normalized);
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-5 pb-28 pt-6">
      <header className="rounded-[30px] bg-[linear-gradient(180deg,#09244A_0%,#071A3A_100%)] p-5 text-white shadow-[0_16px_32px_rgba(8,27,56,0.14)]">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <Sparkles className="h-7 w-7 text-blue-100" />
          </span>
          <div>
            <p className="text-xs font-black text-blue-100">질문 수집 실험</p>
            <h1 className="text-3xl font-black">포유AI</h1>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-blue-50/90">
          지금은 답변형 AI가 아니라, 사용자가 앱 안에서 무엇을 궁금해하는지 모으는 MVP입니다.
        </p>
      </header>

      <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="궁금한 내용을 적어보세요"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-[#0B63F6]"
          />
          <button type="submit" className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B63F6] text-white" aria-label="질문 제출">
            <Send className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuestion(example)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700"
            >
              {example}
            </button>
          ))}
        </div>

        {submitted ? (
          <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-slate-700">
            질문을 기록했습니다. 비슷한 질문이 많아지면 기능으로 반영합니다.
          </div>
        ) : null}
      </section>
    </div>
  );
}
