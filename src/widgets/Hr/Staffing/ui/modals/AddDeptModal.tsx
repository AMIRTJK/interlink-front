import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid } from 'lucide-react';
import { IStaffingDepartment, IEmployee } from '../../model';
import { EmployeePickerModal } from './EmployeePickerModal';
import { If } from '@shared/ui/If';
import { AddDeptManagerSlot } from './addDeptModal/AddDeptManagerSlot';
import { AddDeptCuratorSlot } from './addDeptModal/AddDeptCuratorSlot';

export interface IAddDeptModalProps {
  orgName: string;
  existingDepts: IStaffingDepartment[];
  employees: IEmployee[];
  onClose: () => void;
  onSave: (
    name: string,
    curatorName: string,
    managerId: number | null,
    managerName: string,
    parentDeptId: number | null
  ) => void;
  dark?: boolean;
}

export const AddDeptModal = ({
  orgName,
  existingDepts,
  employees,
  onClose,
  onSave,
  dark = false,
}: IAddDeptModalProps) => {
  const [name, setName] = useState('');
  const [parentDeptId, setParentDeptId] = useState<number | null>(null);
  const [curatorId, setCuratorId] = useState<number | null>(null);
  const [curatorName, setCuratorName] = useState('');
  const [managerId, setManagerId] = useState<number | null>(null);
  const [managerName, setManagerName] = useState('');
  const [curatorPickerOpen, setCuratorPickerOpen] = useState(false);
  const [managerPickerOpen, setManagerPickerOpen] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const currentCount = Number(document.body.getAttribute('data-modal-count') || 0);
    if (currentCount === 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    }
    document.body.setAttribute('data-modal-count', String(currentCount + 1));
    return () => {
      const nextCount = Number(document.body.getAttribute('data-modal-count') || 1) - 1;
      document.body.setAttribute('data-modal-count', String(nextCount));
      if (nextCount <= 0) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.removeAttribute('data-modal-count');
      }
    };
  }, []);

  const selectedCuratorEmp = employees.find((e) => e.id === curatorId) ?? null;
  const selectedManagerEmp = employees.find((e) => e.id === managerId) ?? null;

  const cardBg = dark ? 'bg-th-base' : 'bg-white';
  const inputBg = dark
    ? 'bg-th-raised border-th-high text-gray-100 placeholder:text-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400';
  const selectBg = dark
    ? 'bg-th-raised border-th-high text-gray-200'
    : 'bg-gray-50 border-gray-200 text-gray-700';
  const labelCls = dark ? 'text-gray-400' : 'text-gray-500';
  const cancelCls = dark
    ? 'bg-th-raised text-gray-300 hover:bg-th-high'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  const sectionDivider = dark ? 'border-th-high/60' : 'border-gray-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
        className={`relative ${cardBg} rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-50`}
      >
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: dark ? '#374151' : '#f3f4f6' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-th-accent-500 to-th-accent-700 flex items-center justify-center">
                <LayoutGrid size={16} className="text-white" />
              </div>
              <div>
                <h2
                  className={`text-base font-bold ${
                    dark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Новый отдел
                </h2>
                <p
                  className={`text-xs truncate max-w-[180px] mt-0.5 ${
                    dark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {orgName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                dark ? 'hover:bg-th-raised text-gray-400' : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              Название *
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Финансовый отдел"
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-th-accent-500/20 transition-all ${inputBg} ${
                error ? 'border-red-400' : ''
              }`}
            />
            <If is={!!error}>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </If>
          </div>
          <If is={existingDepts.length > 0}>
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
              >
                Подчинён отделу
              </label>
              <select
                value={parentDeptId ?? ''}
                onChange={(e) =>
                  setParentDeptId(e.target.value ? Number(e.target.value) : null)
                }
                className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-th-accent-500/20 transition-all ${selectBg}`}
              >
                <option value="">— Корневой отдел —</option>
                {existingDepts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </If>
          <div className={`border-t ${sectionDivider}`} />

          <AddDeptManagerSlot
            dark={dark}
            selectedManagerEmp={selectedManagerEmp}
            onClear={() => {
              setManagerId(null);
              setManagerName('');
            }}
            onOpenPicker={() => setManagerPickerOpen(true)}
          />

          <AddDeptCuratorSlot
            dark={dark}
            selectedCuratorEmp={selectedCuratorEmp}
            onClear={() => {
              setCuratorId(null);
              setCuratorName('');
            }}
            onOpenPicker={() => setCuratorPickerOpen(true)}
          />

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${cancelCls}`}
            >
              Отмена
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!name.trim()) {
                  setError('Введите название');
                  return;
                }
                onSave(name.trim(), curatorName, managerId, managerName, parentDeptId);
              }}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all shadow-lg ${
                name.trim()
                  ? 'bg-th-accent-600 text-white hover:bg-th-accent-700'
                  : dark
                  ? 'bg-th-high text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Создать
            </motion.button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        <If is={managerPickerOpen}>
          <EmployeePickerModal
            employees={employees}
            selectedId={managerId}
            onSelect={(emp) => {
              setManagerId(emp.id);
              setManagerName(`${emp.lastName} ${emp.firstName}`);
            }}
            onClose={() => setManagerPickerOpen(false)}
            title="Выбор руководителя"
            dark={dark}
          />
        </If>
        <If is={curatorPickerOpen}>
          <EmployeePickerModal
            employees={employees}
            selectedId={curatorId}
            onSelect={(emp) => {
              setCuratorId(emp.id);
              setCuratorName(`${emp.lastName} ${emp.firstName}`);
            }}
            onClose={() => setCuratorPickerOpen(false)}
            title="Выбор куратора"
            dark={dark}
          />
        </If>
      </AnimatePresence>
    </div>
  );
};
