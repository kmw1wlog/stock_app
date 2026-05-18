import type { Metadata } from 'next';
import { LegalPageShell, LegalSection } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: '투자 유의사항 | 급등주 for you',
  description: '급등주 for you 투자 유의사항',
};

export default function InvestmentNoticePage() {
  return (
    <LegalPageShell
      title="투자 유의사항"
      subtitle="급등주 for you는 시장 흐름과 조건 기반 알림을 참고용으로 제공하며, 투자 판단을 대신하지 않습니다."
      effectiveDate="2026년 5월 18일"
    >
      <LegalSection title="1. 정보 제공의 성격">
        <p>
          앱에서 제공하는 종목 카드, 뉴스·공시 요약, 유사 종목, 알림 조건은 투자 참고용 정보입니다.
          특정 종목의 매수·매도 또는 보유를 권유하는 투자 자문 서비스가 아닙니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 수익 보장 부재">
        <p>
          앱은 수익을 보장하지 않으며, 급등 또는 상승 가능성을 확정적으로 약속하지 않습니다. 과거 흐름,
          실시간 신호, 알림 조건은 미래 성과를 보장하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="3. 데이터 지연 및 오류 가능성">
        <p>
          시세, 뉴스, 공시, 유사 종목, 알림 신호는 외부 데이터 제공처 또는 내부 계산 로직에 따라 지연되거나
          일부 누락될 수 있습니다. 서비스는 정확성과 완전성을 위해 노력하지만, 모든 데이터의 실시간성이나
          무오류를 보장하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 투자 판단과 책임">
        <p>
          모든 투자 판단과 그 결과에 대한 책임은 사용자 본인에게 있습니다. 실제 주문, 포트폴리오 구성,
          매매 타이밍 판단은 본인의 조사와 판단에 따라 결정해야 합니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 외부 링크 및 제3자 정보">
        <p>
          앱은 뉴스, 공시, 유튜브, X, 증권사 앱 등 외부 서비스로 연결될 수 있습니다. 외부 서비스의 정보와
          기능은 각 제공자의 정책과 품질에 따르며, 당사는 그 내용을 보증하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="6. 문의">
        <p>서비스 및 투자 관련 고지 문의: kmw1wlog@gmail.com</p>
      </LegalSection>
    </LegalPageShell>
  );
}
