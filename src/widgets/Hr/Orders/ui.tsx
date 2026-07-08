import React, { useState, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { If } from '@shared/ui/If';
import { ApiRoutes } from '@shared/api';
import { useGetQuery, useMutationQuery } from '@shared/lib';
import type { IHrOrder } from '@entities/hr';
import { IOrderRecord, TOrderStatus, normalizeOrders, ORDER_STATUS_LABELS } from './model';
import { OrderFilters, TMinisterFilter } from './ui/OrderFilters';
import { OrderList } from './ui/OrderList';
import { OrderDetailModal } from './ui/OrderDetailModal';
import { OrderForm } from './ui/OrderForm';

export const OrdersWidget = () => {
  const { data, isLoading } = useGetQuery({
    url: ApiRoutes.GET_HR_ORDERS,
    useToken: true,
  });

  const orders = useMemo<IOrderRecord[]>(() => {
    const raw = (data?.data?.data || data?.data || data || []) as IHrOrder[];
    return normalizeOrders(raw);
  }, [data]);

  const createM = useMutationQuery({
    url: ApiRoutes.CREATE_HR_ORDER,
    method: 'POST',
    messages: {
      success: 'Приказ создан',
      invalidate: [ApiRoutes.GET_HR_ORDERS],
    },
  });

  // --- States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TOrderStatus | 'Все'>('Все');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [executorQuery, setExecutorQuery] = useState('');
  const [ministerFilter, setMinisterFilter] = useState<TMinisterFilter>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    !!dateFrom ||
    !!dateTo ||
    !!executorQuery ||
    ministerFilter !== 'all';

  // Modals state
  const [selectedExtOrder, setSelectedExtOrder] = useState<IOrderRecord | null>(null);
  const [editingOrder, setEditingOrder] = useState<IOrderRecord | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  // --- Statistics ---
  const statCards = useMemo(() => [
    { label: 'Всего', value: orders.length, color: '#1E3A5F' },
    { label: 'Утверждено', value: orders.filter((o) => o.status === 'approved').length, color: '#3b82f6' },
    { label: 'Подписано', value: orders.filter((o) => o.status === 'signed').length, color: '#10b981' },
    { label: 'На подписании', value: orders.filter((o) => o.status === 'pending').length, color: '#f59e0b' },
    { label: 'Черновик', value: orders.filter((o) => o.status === 'draft').length, color: '#94a3b8' },
  ], [orders]);

  // Приводим дату приказа к ISO (YYYY-MM-DD) для сравнения диапазона
  const toISO = (d?: string) => {
    if (!d) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
    const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return '';
  };

  // --- Filtering Logic ---
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        o.type.toLowerCase().includes(q) ||
        o.number.toLowerCase().includes(q) ||
        o.executorName.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'Все' || o.status === statusFilter;
      const matchType = selectedTypes.length === 0 || selectedTypes.includes(o.type);

      const iso = toISO(o.date);
      const matchFrom = !dateFrom || (!!iso && iso >= dateFrom);
      const matchTo = !dateTo || (!!iso && iso <= dateTo);

      const matchExecutor =
        !executorQuery ||
        o.executorName.toLowerCase().includes(executorQuery.toLowerCase());

      const matchMinister =
        ministerFilter === 'all' ||
        (ministerFilter === 'signed' ? o.ministerSigned : !o.ministerSigned);

      return (
        matchSearch &&
        matchStatus &&
        matchType &&
        matchFrom &&
        matchTo &&
        matchExecutor &&
        matchMinister
      );
    });
  }, [
    orders,
    searchQuery,
    statusFilter,
    selectedTypes,
    dateFrom,
    dateTo,
    executorQuery,
    ministerFilter,
  ]);

  const handleResetFilters = () => {
    setSelectedTypes([]);
    setDateFrom('');
    setDateTo('');
    setExecutorQuery('');
    setMinisterFilter('all');
  };

  // --- Handlers ---
  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSaveOrder = (payload: any) => {
    createM.mutate(payload, {
      onSuccess: () => {
        setNewOrderOpen(false);
        setEditingOrder(null);
      },
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 p-6 min-h-0">
      <div className="w-full space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Приказы</h2>
            <p className="text-sm mt-0.5 text-slate-500">
              Управление приказами организации
            </p>
          </div>
          <button
            onClick={() => {
              setEditingOrder(null);
              setNewOrderOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] text-white px-5 py-2 text-[13px] font-medium shadow-sm hover:shadow-md hover:bg-[#2D4A7A] transition-all shrink-0"
          >
            <Plus size={16} />
            <span>Добавить</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl px-5 py-4 bg-white border border-slate-100">
              <p className="text-[28px] font-bold leading-none tabular-nums" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-xs mt-2 text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search Container */}
        <div className="flex flex-col gap-2">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('Все')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-transparent ${
                statusFilter === 'Все'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-[#1E3A5F]'
              }`}
            >
              Все
            </button>
            {(['draft', 'pending', 'signed', 'approved'] as TOrderStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-transparent ${
                  statusFilter === s
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-[#1E3A5F]'
                }`}
              >
                {ORDER_STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Search Bar + Toggle Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Поиск по приказам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm bg-white border-slate-200 text-gray-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/10 focus:border-[#1E3A5F] transition-all"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                filtersOpen || hasActiveFilters
                  ? 'bg-[#1E3A5F]/5 border-[#1E3A5F]/30 text-[#1E3A5F]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Фильтры</span>
              <If is={hasActiveFilters}>
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-1" />
              </If>
            </button>
          </div>

          {/* Expandable Advanced Filters */}
          <AnimatePresence>
            <If is={filtersOpen}>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <OrderFilters
                  selectedTypes={selectedTypes}
                  onTypeToggle={handleTypeToggle}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateFrom={setDateFrom}
                  onDateTo={setDateTo}
                  executorQuery={executorQuery}
                  onExecutorQuery={setExecutorQuery}
                  ministerFilter={ministerFilter}
                  onMinisterFilter={setMinisterFilter}
                  onReset={handleResetFilters}
                />
              </motion.div>
            </If>
          </AnimatePresence>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Загрузка приказов...</div>
        ) : (
          <OrderList
            orders={filteredOrders}
            onOrderClick={setSelectedExtOrder}
          />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        <If is={!!selectedExtOrder}>
          <motion.div
            key="ext-order-detail-modal"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50"
          >
            <OrderDetailModal
              record={selectedExtOrder!}
              onClose={() => setSelectedExtOrder(null)}
              onEdit={() => {
                setEditingOrder(selectedExtOrder);
                setSelectedExtOrder(null);
                setNewOrderOpen(true);
              }}
            />
          </motion.div>
        </If>

        <If is={newOrderOpen}>
          <motion.div
            key="new-order-form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200]"
          >
            <OrderForm
              initialRecord={editingOrder}
              orderCounter={orders.length + 1}
              title={editingOrder ? `Приказ №${editingOrder.number}` : 'Новый приказ'}
              onClose={() => {
                setNewOrderOpen(false);
                setEditingOrder(null);
              }}
              onSave={handleSaveOrder}
            />
          </motion.div>
        </If>
      </AnimatePresence>
    </div>
  );
};
