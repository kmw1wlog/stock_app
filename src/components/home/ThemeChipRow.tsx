'use client';

import { Chip } from '@/components/common/Chip';

const defaultChips = ['전체', '급등', '상한가', '반도체', '로봇', '바이오', 'AI', '시간외'];

export function ThemeChipRow({ active, onChange, filters = defaultChips }: { active: string; onChange: (value: string) => void; filters?: string[] }) {
  return (
    <div className="hide-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 py-2">
      {filters.map((chip) => (
        <Chip key={chip} active={active === chip} onClick={() => onChange(chip)}>
          {chip}
        </Chip>
      ))}
    </div>
  );
}
