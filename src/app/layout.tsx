import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';
import { APP_RELEASE_NAME, APP_VERSION } from '@/lib/version';

export const metadata: Metadata = {
  title: 'Stock App Data MVP',
  description: '공식 API와 위젯 기준으로 시장 데이터를 표시하는 모바일 앱',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Stock Data', statusBarStyle: 'default' },
  applicationName: `Stock Data ${APP_VERSION}`,
  other: { 'release-name': APP_RELEASE_NAME },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, themeColor: '#0B63F6' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><AppStateProvider>{children}</AppStateProvider></body></html>;
}
