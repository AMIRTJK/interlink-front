import { useEffect } from 'react';

export interface IAssignModalTheme {
  cardBg: string;
  headerBorder: string;
  inputBg: string;
  assignedBg: string;
  assignedItemBg: string;
  nameText: string;
  subText: string;
  rowHover: string;
}

export const getAssignModalTheme = (dark: boolean): IAssignModalTheme => ({
  cardBg: dark ? 'bg-th-base' : 'bg-white',
  headerBorder: dark ? 'border-th-high/60' : 'border-gray-100',
  inputBg: dark
    ? 'bg-th-raised border-th-high text-gray-100 placeholder:text-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400',
  assignedBg: dark ? 'bg-th-accent-900/20' : 'bg-th-accent-50',
  assignedItemBg: dark ? 'bg-th-raised' : 'bg-white',
  nameText: dark ? 'text-gray-100' : 'text-gray-800',
  subText: dark ? 'text-gray-400' : 'text-gray-500',
  rowHover: dark ? 'hover:bg-th-raised' : 'hover:bg-gray-50',
});

/** Блокирует скролл body, пока открыта модалка; счётчик в data-атрибуте позволяет вложенные модалки. */
export const useBodyScrollLock = () => {
  useEffect(() => {
    const currentCount = Number(document.body.getAttribute('data-modal-count') || 0);
    document.body.setAttribute('data-modal-count', String(currentCount + 1));
    document.body.style.overflow = 'hidden';
    return () => {
      const nextCount = Number(document.body.getAttribute('data-modal-count') || 1) - 1;
      document.body.setAttribute('data-modal-count', String(nextCount));
      if (nextCount <= 0) {
        document.body.style.overflow = '';
        document.body.removeAttribute('data-modal-count');
      }
    };
  }, []);
};
