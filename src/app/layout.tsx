import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppStateProvider } from '@/context/AppStateContext';

export const metadata: Metadata = {
  title: '급등주 For You',
  description: '틴더식 추천주 피드 모바일 앱',
  appleWebApp: {
    capable: true,
    title: '급등주 For You',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0B63F6',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
