import React, { useState, useMemo } from 'react';
import { X, Search, Users, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface IEmployeeRowProps {
  emp: IEmployee;
  isSelected: boolean;
  onSelect: () => void;
  dark?: boolean;
  rowHover: string;
  nameText: string;
  subText: string;
}

const EmployeePickerRow = ({
  emp,
  isSelected,
  onSelect,
  dark,
  rowHover,
  nameText,
  subText,
}: IEmployeeRowProps) => {
  const photo = resolvePhotoUrl(emp.avatarPhoto);
  const [isLoaded, setIsLoaded] = useState(!photo);

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 animate-pulse">
        <div
          className={`w-9 h-9 aspect-square rounded-full shrink-0 ${
            dark ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div
            className={`h-3.5 rounded-md w-3/5 ${
              dark ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-2.5 rounded-md w-2/5 ${
              dark ? 'bg-gray-800/60' : 'bg-gray-200/70'
            }`}
          />
        </div>
        <img
          src={photo}
          alt=""
          className="hidden"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 cursor-pointer transition-colors animate-in fade-in duration-150 ${
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
};

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
  const [page, setPage] = useState(1);

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

  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = { page, per_page: 15 };
    if (activeSearch.trim()) p.search = activeSearch.trim();
    return p;
  }, [page, activeSearch]);

  const { data: searchRes, isLoading: isSearchLoading } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    method: 'GET',
    params: queryParams,
    useToken: true,
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

  const paginationMeta = useMemo(() => {
    const pData = (searchRes as any)?.data;
    return {
      currentPage: pData?.current_page ?? page,
      lastPage: pData?.last_page ?? 1,
      total: pData?.total ?? 0,
    };
  }, [searchRes, page]);

  const isLoading = isSearchLoading;
  const displayEmployees = serverEmployees.length > 0 || activeSearch ? serverEmployees : employees;

  const handleSearchSubmit = () => {
    const term = search.trim();
    setPage(1);
    setActiveSearch(term);
  };

  const handleClear = () => {
    setSearch('');
    setPage(1);
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
            {displayEmployees.map((emp) => (
              <EmployeePickerRow
                key={emp.id}
                emp={emp}
                isSelected={emp.id === selectedId}
                onSelect={() => {
                  onSelect(emp);
                  onClose();
                }}
                dark={dark}
                rowHover={rowHover}
                nameText={nameText}
                subText={subText}
              />
            ))}
          </If>
        </div>
        <div className={`px-4 py-3 border-t ${headerBorder} shrink-0 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <If is={paginationMeta.lastPage > 1}>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <button
                  type="button"
                  disabled={paginationMeta.currentPage <= 1 || isSearchLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Предыдущая страница"
                  aria-label="Предыдущая страница"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-semibold text-gray-700 dark:text-gray-300 px-1">
                  {paginationMeta.currentPage} / {paginationMeta.lastPage}
                </span>
                <button
                  type="button"
                  disabled={paginationMeta.currentPage >= paginationMeta.lastPage || isSearchLoading}
                  onClick={() => setPage((p) => Math.min(paginationMeta.lastPage, p + 1))}
                  className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Следующая страница"
                  aria-label="Следующая страница"
                >
                  <ChevronRight size={14} />
                </button>
                <span className="text-[11px] text-gray-400 ml-1">
                  (всего {paginationMeta.total})
                </span>
              </div>
            </If>
          </div>
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
