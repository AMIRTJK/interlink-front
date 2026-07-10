import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { IStaffingPosition } from '../../model';
import { If } from '@shared/ui/If';

export interface IAddPositionModalProps {
  deptName: string;
  onClose: () => void;
  onSave: (pos: Omit<IStaffingPosition, 'id'>) => void;
  dark?: boolean;
}

export const AddPositionModal = ({
  deptName,
  onClose,
  onSave,
  dark = false,
}: IAddPositionModalProps) => {
  const [posName, setPosName] = useState('');
  const [slots, setSlots] = useState('1');
  const [occupied, setOccupied] = useState('0');
  const [salary, setSalary] = useState('');
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

  const vacant = Math.max(0, Number(slots) - Number(occupied));

  const cardBg = dark ? 'bg-gray-900' : 'bg-white';
  const inputBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400';
  const readonlyBg = dark
    ? 'border-gray-700 bg-gray-800/60 text-gray-500'
    : 'border-gray-100 bg-gray-50 text-gray-400';
  const labelCls = dark ? 'text-gray-400' : 'text-gray-500';
  const cancelCls = dark
    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200';

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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className={`relative ${cardBg} rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-50`}
      >
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: dark ? '#374151' : '#f3f4f6' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <div>
              <h2
                className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}
              >
                Новая должность
              </h2>
              <p
                className={`text-xs truncate max-w-[180px] mt-0.5 ${
                  dark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {deptName}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              Название *
            </label>
            <input
              autoFocus
              type="text"
              value={posName}
              onChange={(e) => {
                setPosName(e.target.value);
                setError('');
              }}
              placeholder="Старший специалист"
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg} ${
                error ? 'border-red-400' : ''
              }`}
            />
            <If is={!!error}>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </If>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
              >
                Ставок
              </label>
              <input
                type="number"
                min="0"
                value={slots}
                onChange={(e) => {
                  setSlots(e.target.value);
                  setOccupied((prev) =>
                    String(Math.min(Number(prev), Number(e.target.value)))
                  );
                }}
                className={`w-full px-3 py-3 rounded-2xl border text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg}`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
              >
                Занято
              </label>
              <input
                type="number"
                min="0"
                max={Number(slots)}
                value={occupied}
                onChange={(e) =>
                  setOccupied(String(Math.min(Number(e.target.value), Number(slots))))
                }
                className={`w-full px-3 py-3 rounded-2xl border text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg}`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
              >
                Вакантно
              </label>
              <div
                className={`w-full px-3 py-3 rounded-2xl border text-sm text-center font-semibold cursor-not-allowed ${readonlyBg}`}
              >
                {vacant}
              </div>
            </div>
          </div>
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${labelCls}`}
            >
              Оклад (₽)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="0"
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg}`}
            />
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
                if (!posName.trim()) {
                  setError('Введите название');
                  return;
                }
                onSave({
                  name: posName.trim(),
                  slots: Number(slots) || 1,
                  occupied: Number(occupied) || 0,
                  vacant,
                  salary: parseFloat(salary) || 0,
                  assignedEmployees: [],
                });
              }}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all shadow-lg ${
                posName.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : dark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Добавить
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
