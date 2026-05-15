import { BottomNav } from './BottomNav';

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-[430px] bg-[#F8FAFC] shadow-[0_0_80px_rgba(8,26,58,0.16)]">
      <main className="min-h-screen pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
