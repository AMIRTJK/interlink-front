import React from 'react';

interface IProps {
  dark?: boolean;
}

export function BubbleLegend({ dark = false }: IProps) {
  return (
    <div
      className={`px-5 pb-4 pt-2 flex items-center gap-4 flex-wrap text-xs ${
        dark ? 'text-gray-500' : 'text-gray-400'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        <span>100% — заполнено</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
        <span>60–99% — норма</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
        <span>30–59% — частично</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
        <span>{'<'}30% — критично</span>
      </span>
      <span className={`ml-auto text-[10px] ${dark ? 'text-gray-600' : 'text-gray-300'}`}>
        Нажмите на пузырь для деталей
      </span>
    </div>
  );
}
