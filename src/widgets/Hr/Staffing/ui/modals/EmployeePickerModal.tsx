import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Users, Check } from 'lucide-react';
import { IEmployee } from '../../model';
import { MiniAvatar } from '../components/MiniAvatar';
import { If } from '@shared/ui/If';

export interface IEmployeePickerModalProps {
  employees: IEmployee[];
  selectedId: number | null;
  onSelect: (emp: IEmployee) => void;
  onClose: () => void;
  title?: string;
  dark?: boolean;
}

export const EmployeePickerModal = ({
  employees,
  selectedId,
  onSelect,
  onClose,
  title = 'Выбор сотрудника',
  dark = false,
}: IEmployeePickerModalProps) => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        `${e.lastName} ${e.firstName} ${e.patronymic}`.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const cardBg = dark ? 'bg-gray-900' : 'bg-white';
  const headerBorder = dark ? 'border-gray-700/60' : 'border-gray-100';
  const inputBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400';
  const rowHover = dark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const nameText = dark ? 'text-gray-100' : 'text-gray-800';
  const subText = dark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`relative ${cardBg} rounded-3xl shadow-2xl w-full max-w-md z-[71] flex flex-col overflow-hidden h-[500px] max-h-[82vh]`}
      >
        <div className={`px-5 py-4 border-b ${headerBorder} shrink-0`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors ${
                dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              <X size={16} />
            </button>
          </div>
          <div className="relative">
            <Search
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                dark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
            <input
              autoFocus
              type="text"
              placeholder="Имя, должность..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg}`}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <If is={filtered.length === 0}>
            <div className={`flex flex-col items-center justify-center py-10 ${subText}`}>
              <Users size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Не найдено</p>
            </div>
          </If>
          {filtered.map((emp, i) => {
            const isSelected = emp.id === selectedId;
            return (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => {
                  onSelect(emp);
                  onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 cursor-pointer transition-all ${
                  isSelected
                    ? dark
                      ? 'bg-indigo-900/20 ring-1 ring-indigo-600/50'
                      : 'bg-indigo-50 ring-1 ring-indigo-200'
                    : rowHover
                }`}
              >
                <MiniAvatar
                  photo={emp.avatarPhoto}
                  initials={emp.avatarInitials}
                  color={emp.avatarColor}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${nameText}`}>
                    {emp.lastName} {emp.firstName}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${subText}`}>
                    {emp.position} · {emp.department}
                  </p>
                </div>
                <If is={isSelected}>
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                </If>
              </motion.div>
            );
          })}
        </div>
        <div className={`px-4 py-3 border-t ${headerBorder} shrink-0 flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              dark
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </div>
  );
};
