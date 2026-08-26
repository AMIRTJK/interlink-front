import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Users, Check } from 'lucide-react';
import { IEmployee, resolvePhotoUrl } from '../../model';
import { MiniAvatar } from '../components/MiniAvatar';
import { If } from '@shared/ui/If';
import { ApiRoutes } from '@shared/api';
import { useGetQuery } from '@shared/lib';

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
  const [activeSearch, setActiveSearch] = useState('');

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

  const { data: searchRes, isLoading: isSearchLoading } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    method: 'GET',
    params: { search: activeSearch },
    options: {
      enabled: activeSearch.trim().length > 0,
    },
  });

  const serverEmployees = useMemo<IEmployee[]>(() => {
    const raw = (searchRes?.data?.data || searchRes?.data || searchRes || []) as any[];
    if (!Array.isArray(raw)) return [];
    return raw.map((u: any) => ({
      id: u.id,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      patronymic: u.middle_name || '',
      position: u.position || '—',
      department: u.departments?.[0]?.name || '—',
      status: u.hr_status || 'active',
      email: u.corporate_email || u.email || '',
      phone: u.corporate_phone || u.phone || '',
      salary: u.salary ? Number(u.salary) : 0,
      avatarColor: '#6366f1',
      avatarInitials: `${u.last_name?.[0] || ''}${u.first_name?.[0] || ''}`.toUpperCase() || '??',
      avatarPhoto: u.photo_url || resolvePhotoUrl(u.photo_path),
      rating: u.rating || 0,
    }));
  }, [searchRes]);

  const isInitialLoading = !activeSearch && employees.length === 0;
  const isLoading = (!!activeSearch && isSearchLoading) || isInitialLoading;
  const displayEmployees = activeSearch ? serverEmployees : employees;

  const handleSearchSubmit = () => {
    const term = search.trim();
    setActiveSearch(term);
  };

  const handleClear = () => {
    setSearch('');
    setActiveSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const cardBg = dark ? 'bg-gray-900' : 'bg-white';
  const headerBorder = dark ? 'border-gray-700/60' : 'border-gray-100';
  const inputBg = dark
    ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600'
    : 'bg-gray-50 border-gray-200 text-gray-700 placeholder:text-gray-400';
  const rowHover = dark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const nameText = dark ? 'text-gray-100' : 'text-gray-800';
  const subText = dark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />
      <div
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
              onKeyDown={handleKeyDown}
              className={`w-full pl-9 ${search ? 'pr-16' : 'pr-3'} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${inputBg}`}
            />
            <If is={!!search}>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="p-1 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                  title="Искать"
                  aria-label="Искать"
                >
                  <Search size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Очистить"
                  aria-label="Очистить"
                >
                  <X size={14} />
                </button>
              </div>
            </If>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 [scrollbar-gutter:stable]">
          <If is={isLoading}>
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl animate-pulse"
                >
                  <div
                    className={`w-9 h-9 aspect-square rounded-full shrink-0 ${
                      dark ? 'bg-gray-800' : 'bg-gray-200'
                    }`}
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div
                      className={`h-3.5 rounded-md ${
                        dark ? 'bg-gray-800' : 'bg-gray-200'
                      }`}
                      style={{ width: `${55 + (idx % 3) * 15}%` }}
                    />
                    <div
                      className={`h-2.5 rounded-md ${
                        dark ? 'bg-gray-800/60' : 'bg-gray-200/70'
                      }`}
                      style={{ width: `${35 + (idx % 2) * 20}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </If>
          <If is={!isLoading && displayEmployees.length === 0}>
            <div className={`flex flex-col items-center justify-center py-10 ${subText}`}>
              <Users size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Не найдено</p>
            </div>
          </If>
          <If is={!isLoading}>
            {displayEmployees.map((emp) => {
              const isSelected = emp.id === selectedId;
              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    onSelect(emp);
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 cursor-pointer transition-colors ${
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
                </div>
              );
            })}
          </If>
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
      </div>
    </div>
  );
};
