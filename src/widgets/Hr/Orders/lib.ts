import { TOrderStatus } from './model';

export const ORDER_STATUS_CONFIG: Record<
  TOrderStatus,
  { bg: string; text: string; dot: string }
> = {
  'Черновик': {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  },
  'На подписании': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  'Подписан': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  'Утверждён': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
};

const RU_MONTHS_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export const parseDate = (dateStr: string) => {
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[2];
    return {
      day,
      month: RU_MONTHS_GEN[monthIdx] ?? parts[1],
      year,
    };
  }
  return {
    day: '___',
    month: '______',
    year: '____',
  };
};

export const getExecutorInitials = (executorName: string) => {
  if (!executorName) return '';
  return executorName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};
