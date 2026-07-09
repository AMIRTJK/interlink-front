import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, Network, ChevronDown, UserCircle2, Pencil } from 'lucide-react';
import { ISubOrganization, IEmployee, ORG_TYPES } from '../../model';
import { EmployeePickerModal } from './EmployeePickerModal';
import { MiniAvatar } from '../components/MiniAvatar';
import { If } from '@shared/ui/If';

export interface IEditOrgModalProps {
  org: ISubOrganization;
  employees: IEmployee[];
  dark?: boolean;
  onClose: () => void;
  onSave: (
    orgId: number,
    name: string,
    shortName: string,
    type: string,
    isMain: boolean,
    curatorName: string
  ) => void;
}

export const EditOrgModal = ({
  org,
  employees,
  dark = false,
  onClose,
  onSave,
}: IEditOrgModalProps) => {
  const [name, setName] = useState(org.name);
  const [shortName, setShortName] = useState(org.shortName);
  const [type, setType] = useState(org.type);
  const [isMain, setIsMain] = useState(org.isMain);
  const [curatorId, setCuratorId] = useState<number | null>(org.curatorId);
  const [curatorName, setCuratorName] = useState(org.curatorName);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState('');

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

  const selectedEmp = employees.find((e) => e.id === curatorId) ?? null;

  const cardBg = dark ? 'bg-gray-900' : 'bg-white';
  const inputBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-100'
    : 'bg-gray-50 border-gray-200 text-gray-800';
  const labelCls = dark ? 'text-gray-400' : 'text-gray-500';
  const typeBtnActive = dark
    ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300'
    : 'bg-indigo-50 border-indigo-300 text-indigo-700';
  const typeBtnInactive = dark
    ? 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50';
  const cancelCls = dark
    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  const curatorBtnCls = dark
    ? 'border-gray-700 bg-gray-800 text-gray-400 hover:border-indigo-600'
    : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-300';
  const curatorSelectedCls = dark
    ? 'border-indigo-600/50 bg-indigo-900/20'
    : 'border-indigo-200 bg-indigo-50';

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
        className={`relative ${cardBg} rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-50`}
      >
        <div
          className="px-6 py-4"
          style={{
            background: isMain
              ? 'linear-gradient(135deg,#b45309,#d97706)'
              : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                <If is={isMain}>
                  <Landmark size={16} className="text-white" />
                </If>
                <If is={!isMain}>
                  <Network size={16} className="text-white" />
                </If>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Редактировать организацию</h2>
                <p className="text-xs text-white/60 mt-0.5">
                  {isMain ? 'Вышестоящая организация' : 'Подведомственная'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div
            className={`flex items-center justify-between p-3.5 rounded-2xl border ${
              isMain
                ? dark
                  ? 'border-amber-800/40 bg-amber-900/20'
                  : 'border-amber-200 bg-amber-50'
                : dark
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <p className={`text-sm font-semibold ${dark ? 'text-gray-200' : 'text-gray-800'}`}>
              Вышестоящая организация
            </p>
            <button
              type="button"
              onClick={() => setIsMain((v) => !v)}
              className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
                isMain ? 'bg-amber-500' : dark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <motion.span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{ left: isMain ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              Тип
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ORG_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    type === t ? typeBtnActive : typeBtnInactive
                  }`}
                >
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              Полное название *
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
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              Аббревиатура
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg}`}
            />
          </div>
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              Куратор
            </label>
            <If is={!!selectedEmp}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${curatorSelectedCls}`}
              >
                <MiniAvatar
                  photo={selectedEmp?.avatarPhoto}
                  initials={selectedEmp?.avatarInitials}
                  color={selectedEmp?.avatarColor}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      dark ? 'text-indigo-300' : 'text-indigo-800'
                    }`}
                  >
                    {selectedEmp?.lastName} {selectedEmp?.firstName}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      dark ? 'text-indigo-400/70' : 'text-indigo-600/70'
                    }`}
                  >
                    {selectedEmp?.position}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCuratorId(null);
                    setCuratorName('');
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    dark
                      ? 'text-indigo-400 hover:bg-indigo-900/40'
                      : 'text-indigo-500 hover:bg-indigo-100'
                  }`}
                >
                  <X size={13} />
                </button>
                <button
                  onClick={() => setPickerOpen(true)}
                  className={`p-1 rounded-lg transition-colors ${
                    dark
                      ? 'text-indigo-400 hover:bg-indigo-900/40'
                      : 'text-indigo-500 hover:bg-indigo-100'
                  }`}
                >
                  <Pencil size={13} />
                </button>
              </div>
            </If>
            <If is={!selectedEmp}>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${curatorBtnCls}`}
              >
                <UserCircle2 size={16} className={dark ? 'text-gray-500' : 'text-gray-400'} />
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
                  org.id,
                  name.trim(),
                  shortName.trim() || name.trim(),
                  type,
                  isMain,
                  curatorName
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
        <If is={pickerOpen}>
          <EmployeePickerModal
            employees={employees}
            selectedId={curatorId}
            onSelect={(emp) => {
              setCuratorId(emp.id);
              setCuratorName(`${emp.lastName} ${emp.firstName}`);
            }}
            onClose={() => setPickerOpen(false)}
            dark={dark}
          />
        </If>
      </AnimatePresence>
    </div>
  );
};
