'use client';

import { usePathname } from 'next/navigation';
import { Bell, Folder, Home, Search, Trophy } from 'lucide-react';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/explore', label: '탐색', icon: Search },
  { href: '/rankings', label: '랭킹', icon: Trophy },
  { href: '/alerts', label: '알림', icon: Bell },
  { href: '/saved', label: '보관함', icon: Folder },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 grid h-[78px] w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-2 backdrop-blur-xl">
      {navItems.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => {
              event.preventDefault();
              window.setTimeout(() => window.location.assign(item.href), 0);
            }}
            className="flex flex-col items-center justify-center gap-1"
          >
            <Icon className={active ? 'h-6 w-6 text-[#0B63F6]' : 'h-6 w-6 text-slate-500'} strokeWidth={active ? 2.8 : 2.2} />
            <span className={active ? 'text-[11px] font-black text-[#0B63F6]' : 'text-[11px] font-bold text-slate-500'}>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
