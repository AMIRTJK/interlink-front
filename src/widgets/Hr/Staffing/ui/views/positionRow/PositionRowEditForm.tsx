import React from 'react';
import { Check } from 'lucide-react';
import type { IStaffingPosition } from '../../../model';

interface IProps {
  pos: IStaffingPosition;
  dark?: boolean;
  editName: string;
  setEditName: (val: string) => void;
  editSlots: string;
  setEditSlots: (val: string) => void;
  editOccupied: string;
  setEditOccupied: (val: string) => void;
  editSalary: string;
  setEditSalary: (val: string) => void;
  editVacant: number;
  onCancel: () => void;
  onSave: () => void;
}

export function PositionRowEditForm({
  pos,
  dark = false,
  editName,
  setEditName,
  editSlots,
  setEditSlots,
  editOccupied,
  setEditOccupied,
  editSalary,
  setEditSalary,
  editVacant,
  onCancel,
  onSave,
}: IProps) {
  const inputCls = dark
    ? 'bg-gray-700 border-gray-600 text-gray-100'
    : 'bg-white border-indigo-200 text-gray-800';

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${inputCls}`}
          />
        </div>
        <div>
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
              dark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Ставок
          </label>
          <input
            type="number"
            min="0"
            value={editSlots}
            onChange={(e) => setEditSlots(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold focus:outline-none ${inputCls}`}
          />
        </div>
        <div>
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
              dark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Занято
          </label>
          <input
            type="number"
            min="0"
            max={Number(editSlots)}
            value={editOccupied}
            onChange={(e) =>
              setEditOccupied(
                String(Math.min(Number(e.target.value), Number(editSlots)))
              )
            }
            className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold focus:outline-none ${inputCls}`}
          />
        </div>
        <div>
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
              dark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Вак.
          </label>
          <div
            className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold ${
              dark
                ? 'border-gray-700 bg-gray-800/60 text-gray-500'
                : 'border-gray-100 bg-gray-50 text-gray-400'
            }`}
          >
            {editVacant}
          </div>
        </div>
        <div>
          <label
            className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
              dark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            Оклад
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={editSalary}
            onChange={(e) => setEditSalary(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border text-sm text-center font-semibold focus:outline-none ${inputCls}`}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Отмена
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Check size={12} />
          <span>Сохранить</span>
        </button>
      </div>
    </div>
  );
}
