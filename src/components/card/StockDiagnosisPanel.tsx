import type { StockDiagnosis } from '@/lib/diagnosis/buildStockDiagnosis';
import type { DiagnosisGrade } from '@/lib/diagnosis/diagnosisLabels';

const gradeClass: Record<DiagnosisGrade, string> = {
  very_good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  good: 'border-blue-200 bg-blue-50 text-blue-700',
  neutral: 'border-slate-200 bg-white text-slate-700',
  caution: 'border-amber-200 bg-amber-50 text-amber-700',
  risk: 'border-red-200 bg-red-50 text-red-700',
};

export function StockDiagnosisPanel({ diagnosis }: { diagnosis: StockDiagnosis }) {
  return (
    <section className="px-5">
      <h2 className="mb-3 text-xl font-black">종목 진단</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className={`col-span-2 rounded-3xl border p-5 ${gradeClass[diagnosis.scoreGrade]}`}>
          <p className="text-xs font-black opacity-80">종목진단점수</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-4xl font-black">{diagnosis.score}/100</p>
            <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-black">{diagnosis.scoreLabel}</span>
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 opacity-80">{diagnosis.basis}</p>
        </div>

        <DiagnosisBox label="수급별점" value={diagnosis.supplyStars} grade="good" helpText={diagnosis.supplyHelpText} />
        <DiagnosisBox label="주도주체" value={diagnosis.leader} grade="neutral" helpText="기관·외인·개인 수급 방향을 라벨로 변환했습니다." />
        {diagnosis.items.map((item) => (
          <DiagnosisBox key={item.label} {...item} />
        ))}
        <DiagnosisBox {...diagnosis.afterHours} />
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
        본 진단은 지표 기반 참고 정보이며 매수·매도 추천이 아닙니다.
      </p>
    </section>
  );
}

function DiagnosisBox({ label, value, grade, helpText }: { label: string; value: string; grade: DiagnosisGrade; helpText: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${gradeClass[grade]}`}>
      <p className="text-xs font-bold opacity-75">{label}</p>
      <p className="mt-1 text-base font-black text-slate-950">{value}</p>
      <p className="mt-2 line-clamp-3 text-[11px] font-semibold leading-4 opacity-80">{helpText}</p>
    </div>
  );
}
