import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCircle2, Shield, Pencil, ChevronDown } from 'lucide-react';
import { IStaffingDepartment, IEmployee } from '../../model';
import { MiniAvatar } from '../components/MiniAvatar';
import { EmployeePickerModal } from './EmployeePickerModal';
import { If } from '@shared/ui/If';

export interface IEditDeptModalProps {
  dept: IStaffingDepartment;
  orgId: number;
  existingDepts: IStaffingDepartment[];
  employees: IEmployee[];
  dark: boolean;
  onClose: () => void;
  onSave: (
    orgId: number,
    deptId: number,
    name: string,
    curatorName: string,
    managerId: number | null,
    managerName: string,
    parentDeptId: number | null
  ) => void;
}

export const EditDeptModal = ({
  dept,
  orgId,
  existingDepts,
  employees,
  dark,
  onClose,
  onSave,
}: IEditDeptModalProps) => {
  const [name, setName] = useState(dept.name);
  const [curatorId, setCuratorId] = useState<number | null>(dept.curatorId);
  const [curatorName, setCuratorName] = useState(dept.curatorName);
  const [managerId, setManagerId] = useState<number | null>(dept.managerId ?? null);
  const [managerName, setManagerName] = useState(dept.managerName ?? '');
  const [parentDeptId, setParentDeptId] = useState<number | null>(dept.parentDeptId);
  const [curatorPickerOpen, setCuratorPickerOpen] = useState(false);
  const [managerPickerOpen, setManagerPickerOpen] = useState(false);
  const [error, setError] = useState('');

  const selectedCuratorEmp = employees.find((e) => e.id === curatorId) ?? null;
  const selectedManagerEmp = employees.find((e) => e.id === managerId) ?? null;
  const otherDepts = existingDepts.filter((d) => d.id !== dept.id);

  const cardBg = dark ? 'bg-gray-900' : 'bg-white';
  const inputBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-100'
    : 'bg-gray-50 border-gray-200 text-gray-800';
  const selectBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-200'
    : 'bg-gray-50 border-gray-200 text-gray-700';
  const labelCls = dark ? 'text-gray-400' : 'text-gray-500';
  const cancelCls = dark
    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  const personBtnCls = dark
    ? 'border-gray-700 bg-gray-800 text-gray-400 hover:border-indigo-600'
    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-300';
  const personSelectedCls = dark
    ? 'border-indigo-600/50 bg-indigo-900/20'
    : 'border-indigo-200 bg-indigo-50';
  const personNameCls = dark ? 'text-indigo-300' : 'text-indigo-800';
  const personSubCls = dark ? 'text-indigo-400/70' : 'text-indigo-600/70';
  const personActionCls = dark
    ? 'text-indigo-400 hover:bg-indigo-900/40'
    : 'text-indigo-500 hover:bg-indigo-100';
  const sectionDivider = dark ? 'border-gray-700/60' : 'border-gray-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className={`relative ${cardBg} rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-50`}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            borderColor: dark ? '#374151' : '#f3f4f6',
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Редактировать отдел</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-colors"
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
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg} ${
                error ? 'border-red-400' : ''
              }`}
            />
            <If is={!!error}>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </If>
          </div>
          <If is={otherDepts.length > 0}>
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
                className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${selectBg}`}
              >
                <option value="">— Корневой отдел —</option>
                {otherDepts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </If>
          <div className={`border-t ${sectionDivider}`} />
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              <span className="flex items-center gap-1.5">
                <UserCircle2 size={11} />
                <span>Руководитель отдела</span>
              </span>
            </label>
            <If is={!!selectedManagerEmp}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${personSelectedCls}`}
              >
                <MiniAvatar
                  photo={selectedManagerEmp!.avatarPhoto}
                  initials={selectedManagerEmp!.avatarInitials}
                  color={selectedManagerEmp!.avatarColor}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${personNameCls}`}>
                    {selectedManagerEmp!.lastName} {selectedManagerEmp!.firstName}
                  </p>
                  <p className={`text-xs truncate ${personSubCls}`}>
                    {selectedManagerEmp!.position}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setManagerId(null);
                    setManagerName('');
                  }}
                  className={`p-1 rounded-lg transition-colors ${personActionCls}`}
                >
                  <X size={13} />
                </button>
                <button
                  onClick={() => setManagerPickerOpen(true)}
                  className={`p-1 rounded-lg transition-colors ${personActionCls}`}
                >
                  <Pencil size={13} />
                </button>
              </div>
            </If>
            <If is={!selectedManagerEmp}>
              <button
                type="button"
                onClick={() => setManagerPickerOpen(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${personBtnCls}`}
              >
                <UserCircle2
                  size={16}
                  className={dark ? 'text-gray-500' : 'text-gray-400'}
                />
                <span
                  className={
                    managerName
                      ? dark
                        ? 'text-gray-200'
                        : 'text-gray-700'
                      : dark
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }
                >
                  {managerName || 'Выбрать руководителя'}
                </span>
                <ChevronDown
                  size={14}
                  className={`ml-auto ${dark ? 'text-gray-600' : 'text-gray-300'}`}
                />
              </button>
            </If>
          </div>
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              <span className="flex items-center gap-1.5">
                <Shield size={11} />
                <span>Куратор отдела</span>
              </span>
            </label>
            <If is={!!selectedCuratorEmp}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${personSelectedCls}`}
              >
                <MiniAvatar
                  photo={selectedCuratorEmp!.avatarPhoto}
                  initials={selectedCuratorEmp!.avatarInitials}
                  color={selectedCuratorEmp!.avatarColor}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${personNameCls}`}>
                    {selectedCuratorEmp!.lastName} {selectedCuratorEmp!.firstName}
                  </p>
                  <p className={`text-xs truncate ${personSubCls}`}>
                    {selectedCuratorEmp!.position}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCuratorId(null);
                    setCuratorName('');
                  }}
                  className={`p-1 rounded-lg transition-colors ${personActionCls}`}
                >
                  <X size={13} />
                </button>
                <button
                  onClick={() => setCuratorPickerOpen(true)}
                  className={`p-1 rounded-lg transition-colors ${personActionCls}`}
                >
                  <Pencil size={13} />
                </button>
              </div>
            </If>
            <If is={!selectedCuratorEmp}>
              <button
                type="button"
                onClick={() => setCuratorPickerOpen(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${personBtnCls}`}
              >
                <Shield size={16} className={dark ? 'text-gray-500' : 'text-gray-400'} />
                <span
                  className={
                    curatorName
                      ? dark
                        ? 'text-gray-200'
                        : 'text-gray-700'
                      : dark
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }
                >
                  {curatorName || 'Выбрать куратора'}
                </span>
                <ChevronDown
                  size={14}
                  className={`ml-auto ${dark ? 'text-gray-600' : 'text-gray-300'}`}
                />
              </button>
            </If>
          </div>
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
                onSave(
                  orgId,
                  dept.id,
                  name.trim(),
                  curatorName,
                  managerId,
                  managerName,
                  parentDeptId
                );
              }}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20"
            >
              Сохранить
            </motion.button>
          </div>
        </div>
      </motion.div>
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
