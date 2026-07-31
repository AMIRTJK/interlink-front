import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Check } from 'lucide-react';
import { IEmployee } from '../../model';
import { If } from '@shared/ui/If';
import {
  getAssignModalTheme,
  useBodyScrollLock,
} from './assignEmployeeModal/assignEmployeeModalModel';
import { AssignedEmployeesBlock } from './assignEmployeeModal/AssignedEmployeesBlock';
import { EmployeePickList } from './assignEmployeeModal/EmployeePickList';

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

  useBodyScrollLock();

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

  const theme = getAssignModalTheme(dark);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        className={`relative ${theme.cardBg} rounded-3xl shadow-2xl w-full max-w-md z-50 flex flex-col overflow-hidden`}
        style={{ maxHeight: '88vh' }}
      >
        <div className={`px-5 py-4 border-b ${theme.headerBorder} shrink-0`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                Назначить сотрудника
              </h3>
              <p className={`text-xs mt-0.5 ${theme.subText}`}>{positionName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${theme.subText}`}>
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
          <AssignedEmployeesBlock
            assignedEmps={assignedEmps}
            onUnassign={onUnassign}
            dark={dark}
            theme={theme}
          />
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
              className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${theme.inputBg}`}
            />
          </div>
        </div>
        <EmployeePickList
          filtered={filtered}
          assignedIds={assignedIds}
          isFull={isFull}
          onAssign={onAssign}
          onUnassign={onUnassign}
          dark={dark}
          theme={theme}
        />
        <div
          className={`px-4 py-3 border-t ${theme.headerBorder} shrink-0 flex items-center justify-between`}
        >
          <span className={`text-xs ${theme.subText}`}>
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
      </div>
    </div>
  );
};
