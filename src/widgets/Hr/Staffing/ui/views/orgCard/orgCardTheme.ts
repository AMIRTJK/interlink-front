export interface IOrgCardTheme {
  cardBg: string;
  deptAreaBg: string;
  emptyIcon: string;
  emptyText: string;
  addDeptBtnEmpty: string;
  addDeptBtnBottom: string;
  editBtn: string;
  deleteBtn: string;
  addDeptBtn: string;
  chevronBtn: string;
  subText: string;
  nameText: string;
  nameTextNormal: string;
  statBg: string;
  curatorText: string;
}

export const getOrgCardTheme = (dark: boolean): IOrgCardTheme => ({
  cardBg: dark ? 'bg-th-raised/80 border-th-high/60' : 'bg-white border-gray-100',
  deptAreaBg: dark ? 'bg-th-base/40' : '',
  emptyIcon: dark ? 'bg-th-high' : 'bg-gray-50',
  emptyText: dark ? 'text-gray-600' : 'text-gray-400',
  addDeptBtnEmpty: dark
    ? 'border-th-accent-700/50 text-th-accent-400 hover:border-th-accent-500 hover:bg-th-accent-900/20'
    : 'border-dashed border-th-accent-200 text-th-accent-500 hover:border-th-accent-400 hover:bg-th-accent-50/50',
  addDeptBtnBottom: dark
    ? 'border-th-high text-gray-500 hover:border-th-accent-700/50 hover:text-th-accent-400'
    : 'border-dashed border-gray-200 text-gray-400 hover:border-th-accent-200 hover:text-th-accent-500',
  editBtn: dark
    ? 'text-gray-500 hover:bg-th-high hover:text-th-accent-400'
    : 'text-gray-400 hover:bg-gray-100 hover:text-th-accent-600',
  deleteBtn: dark
    ? 'text-gray-500 hover:bg-th-high hover:text-red-400'
    : 'text-gray-400 hover:bg-red-50 hover:text-red-500',
  addDeptBtn: dark
    ? 'border-th-accent-700/50 text-th-accent-400 hover:bg-th-accent-900/20'
    : 'border-th-accent-200 text-th-accent-600 hover:bg-th-accent-50',
  chevronBtn: dark ? 'text-gray-500 hover:bg-th-high' : 'text-gray-400 hover:bg-gray-100',
  subText: dark ? 'text-gray-500' : 'text-gray-400',
  nameText: dark ? 'text-amber-300' : 'text-amber-800',
  nameTextNormal: dark ? 'text-gray-100' : 'text-gray-900',
  statBg: dark ? 'border-th-high bg-th-raised/60' : 'border-gray-100 bg-gray-50',
  curatorText: dark ? 'text-th-accent-400/80' : 'text-th-accent-600/80',
});
