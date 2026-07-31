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
  cardBg: dark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-100',
  deptAreaBg: dark ? 'bg-gray-900/40' : '',
  emptyIcon: dark ? 'bg-gray-700' : 'bg-gray-50',
  emptyText: dark ? 'text-gray-600' : 'text-gray-400',
  addDeptBtnEmpty: dark
    ? 'border-indigo-700/50 text-indigo-400 hover:border-indigo-500 hover:bg-indigo-900/20'
    : 'border-dashed border-indigo-200 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50/50',
  addDeptBtnBottom: dark
    ? 'border-gray-700 text-gray-500 hover:border-indigo-700/50 hover:text-indigo-400'
    : 'border-dashed border-gray-200 text-gray-400 hover:border-indigo-200 hover:text-indigo-500',
  editBtn: dark
    ? 'text-gray-500 hover:bg-gray-700 hover:text-indigo-400'
    : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-600',
  deleteBtn: dark
    ? 'text-gray-500 hover:bg-gray-700 hover:text-red-400'
    : 'text-gray-400 hover:bg-red-50 hover:text-red-500',
  addDeptBtn: dark
    ? 'border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/20'
    : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50',
  chevronBtn: dark ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100',
  subText: dark ? 'text-gray-500' : 'text-gray-400',
  nameText: dark ? 'text-amber-300' : 'text-amber-800',
  nameTextNormal: dark ? 'text-gray-100' : 'text-gray-900',
  statBg: dark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-gray-50',
  curatorText: dark ? 'text-indigo-400/80' : 'text-indigo-600/80',
});
