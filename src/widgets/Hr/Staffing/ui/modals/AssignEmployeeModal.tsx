import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { IEmployee } from '../../model';
import { MiniAvatar } from '../components/MiniAvatar';
import { If } from '@shared/ui/If';

export interface IAssignEmployeeModalProps {
  employees: IEmployee[];
  assignedIds: number[];
  positionName: string;
  slots: number;
  onClose: () => void;
  onAssign: (emp: IEmployee) => void;
  onUnassign: (empId: number) => void;
  dark?: boolean;
}

export const AssignEmployeeModal = ({
  employees,
  assignedIds,
  positionName,
  slots,
  onClose,
  onAssign,
  onUnassign,
  dark = false,
}: IAssignEmployeeModalProps) => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        `${e.lastName} ${e.firstName}`.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const assignedEmps = useMemo(
    () => employees.filter((e) => assignedIds.includes(e.id)),
    [employees, assignedIds]
  );
  const isFull = assignedIds.length >= slots && slots > 0;

  const cardBg = dark ? 'bg-gray-900' : 'bg-white';
  const headerBorder = dark ? 'border-gray-700/60' : 'border-gray-100';
  const inputBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400';
  const assignedBg = dark ? 'bg-indigo-900/20' : 'bg-indigo-50';
  const assignedItemBg = dark ? 'bg-gray-800' : 'bg-white';
  const nameText = dark ? 'text-gray-100' : 'text-gray-800';
  const subText = dark ? 'text-gray-400' : 'text-gray-500';
  const rowHover = dark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className={`relative ${cardBg} rounded-3xl shadow-2xl w-full max-w-md z-50 flex flex-col overflow-hidden`}
        style={{ maxHeight: '88vh' }}
      >
        <div className={`px-5 py-4 border-b ${headerBorder} shrink-0`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                Назначить сотрудника
              </h3>
              <p className={`text-xs mt-0.5 ${subText}`}>{positionName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${subText}`}>
                  <span className="font-bold text-indigo-500">{assignedIds.length}</span>/
                  {slots} ставок
                </span>
                <If is={isFull}>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      dark
                        ? 'bg-amber-900/30 text-amber-400'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    Заполнено
                  </span>
                </If>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors ${
                dark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              <X size={16} />
            </button>
          </div>
          <AnimatePresence>
            <If is={assignedEmps.length > 0}>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`${assignedBg} rounded-2xl p-3 mb-3 overflow-hidden`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${
                    dark ? 'text-indigo-400' : 'text-indigo-500'
                  }`}
                >
                  Назначены
                </p>
                <div className="flex flex-col gap-1">
                  <AnimatePresence>
                    {assignedEmps.map((emp) => (
                      <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 30,
                        }}
                        className={`flex items-center gap-2.5 ${assignedItemBg} rounded-xl px-2.5 py-1.5 shadow-sm`}
                      >
                        <MiniAvatar
                          photo={emp.avatarPhoto}
                          initials={emp.avatarInitials}
                          color={emp.avatarColor}
                          size="xs"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${nameText}`}>
                            {emp.lastName} {emp.firstName}
                          </p>
                        </div>
                        <button
                          onClick={() => onUnassign(emp.id)}
                          className={`p-1 rounded-lg transition-colors ${
                            dark
                              ? 'text-gray-500 hover:text-red-400'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <X size={11} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </If>
          </AnimatePresence>
          <div className="relative">
            <Search
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                dark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
            <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg}`}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((emp, i) => {
            const isAssigned = assignedIds.includes(emp.id);
            const cannotAdd = !isAssigned && isFull;

            return (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() =>
                  cannotAdd
                    ? undefined
                    : isAssigned
                    ? onUnassign(emp.id)
                    : onAssign(emp)
                }
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 transition-all ${
                  cannotAdd ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  isAssigned
                    ? dark
                      ? 'bg-emerald-900/10 ring-1 ring-emerald-700/30'
                      : 'bg-emerald-50 ring-1 ring-emerald-200'
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
                  <p className={`text-xs truncate ${subText}`}>{emp.position}</p>
                </div>
                <If is={isAssigned}>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                </If>
              </motion.div>
            );
          })}
        </div>
        <div
          className={`px-4 py-3 border-t ${headerBorder} shrink-0 flex items-center justify-between`}
        >
          <span className={`text-xs ${subText}`}>
            <span className="font-bold text-indigo-500">{assignedIds.length}</span>{' '}
            назначено
          </span>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20"
          >
            <Check size={14} />
            <span>Готово</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
