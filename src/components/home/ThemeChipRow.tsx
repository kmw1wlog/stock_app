'use client';

import { Chip } from '@/components/common/Chip';

const defaultChips = ['오늘 급등', '저장 급증', '놓친 카드', '차트자리', '조건식 인기'];

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
