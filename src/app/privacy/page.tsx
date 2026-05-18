import type { Metadata } from 'next';
import { LegalPageShell, LegalSection } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 급등주 for you',
  description: '급등주 for you 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="개인정보처리방침"
      subtitle="급등주 for you는 국내 주식 시장의 종목 흐름, 뉴스·공시 확인, 관심 종목 저장, 조건 기반 알림 설정을 돕는 정보 제공 앱입니다."
      effectiveDate="2026년 5월 18일"
    >
      <LegalSection title="1. 수집하는 정보">
        <p>앱은 다음 정보를 서비스 제공 목적으로 처리할 수 있습니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>사용자가 저장한 관심 종목</li>
          <li>사용자가 설정한 알림 조건</li>
          <li>앱 내 화면 조회 및 버튼 클릭 등 기본 사용 기록</li>
          <li>오류 확인을 위한 기기/브라우저 환경 정보</li>
          <li>서버 접속 로그(IP, User-Agent, 접속 시각 등)</li>
        </ul>
        <p>
          현재 앱은 이름, 주민등록번호, 주소, 연락처, 위치정보, 연락처, 사진, 마이크, 카메라 정보,
          금융계좌 정보, 결제정보를 요구하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 정보 이용 목적">
        <p>수집 또는 처리되는 정보는 다음 목적으로만 사용됩니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>관심 종목 및 알림 조건 저장</li>
          <li>종목 카드, 뉴스, 공시, 유사 종목 정보 제공</li>
          <li>앱 오류 확인 및 서비스 안정성 개선</li>
          <li>부정 사용 방지 및 보안 유지</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. 제3자 제공">
        <p>
          앱은 사용자의 개인정보를 판매하지 않습니다. 다만 서비스 운영을 위해 호스팅, 데이터베이스,
          분석 도구 등 외부 서비스 제공자가 데이터를 처리할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 보안">
        <p>앱은 HTTPS를 통해 데이터를 전송하며, 서비스 운영에 필요한 범위에서 접근 권한을 제한합니다.</p>
      </LegalSection>

      <LegalSection title="5. 보관 및 삭제">
        <p>
          관심 종목, 알림 조건, 사용 기록은 서비스 제공 및 품질 개선에 필요한 기간 동안 보관될 수
          있습니다. 사용자는 아래 문의처를 통해 데이터 삭제를 요청할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="6. 투자 관련 고지">
        <p>
          본 앱은 매수·매도 추천, 투자 자문, 수익 보장 서비스를 제공하지 않습니다. 앱에서 제공하는
          종목 정보, 뉴스, 공시, 알림 조건은 참고용 정보이며, 모든 투자 판단과 책임은 사용자 본인에게
          있습니다.
        </p>
      </LegalSection>

      <LegalSection title="7. 문의">
        <p>개인정보 관련 문의: kmw1wlog@gmail.com</p>
      </LegalSection>
    </LegalPageShell>
  );
}
