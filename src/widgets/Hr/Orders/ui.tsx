import React, { useState, useMemo } from 'react';
import { Plus, BookOpen, Search, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { If } from '@shared/ui/If';
import { IOrderRecord, ORDERS_DATA, TOrderStatus } from './model';
import { OrderFilters } from './ui/OrderFilters';
import { OrderList } from './ui/OrderList';
import { OrderDetailModal } from './ui/OrderDetailModal';
import { OrderForm } from './ui/OrderForm';

export const OrdersWidget = () => {
  // --- States ---
  const [orders, setOrders] = useState<IOrderRecord[]>(ORDERS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TOrderStatus | 'Все'>('Все');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Modals state
  const [selectedExtOrder, setSelectedExtOrder] = useState<IOrderRecord | null>(null);
  const [editingOrder, setEditingOrder] = useState<IOrderRecord | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  // --- Statistics ---
  const statCards = [
    { label: 'Всего', value: orders.length, color: '#1E3A5F' },
    { label: 'Утверждено', value: orders.filter((o) => o.status === 'Утверждён').length, color: '#3b82f6' },
    { label: 'Подписано', value: orders.filter((o) => o.status === 'Подписан').length, color: '#10b981' },
    { label: 'На подписании', value: orders.filter((o) => o.status === 'На подписании').length, color: '#f59e0b' },
    { label: 'Черновик', value: orders.filter((o) => o.status === 'Черновик').length, color: '#94a3b8' },
  ];

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

      return matchSearch && matchStatus && matchType;
    });
  }, [orders, searchQuery, statusFilter, selectedTypes]);

  // --- Handlers ---
  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSaveOrder = (newOrder: IOrderRecord) => {
    if (editingOrder) {
      setOrders((prev) => prev.map((o) => (o.id === newOrder.id ? newOrder : o)));
    } else {
      setOrders((prev) => [newOrder, ...prev]);
    }
    setNewOrderOpen(false);
    setEditingOrder(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50 p-6 min-h-0">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Приказы</h2>
            <p className="text-sm mt-1 text-slate-500">
              Управление приказами организации
            </p>
          </div>
          <button
            onClick={() => {
              setEditingOrder(null);
              setNewOrderOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A5F] text-white text-sm font-medium hover:bg-[#152a45] hover:shadow-md hover:shadow-[#1E3A5F]/20 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus size={16} />
            <span>Добавить</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl px-5 py-4 bg-white border border-slate-100 shadow-sm">
              <p className="text-[28px] font-bold leading-none tabular-nums" style={{ color: card.color }}>
                {card.value}
              </p>
              <p className="text-[12px] mt-2 font-medium text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search Container */}
        <div className="flex flex-col gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {(['Все', 'Черновик', 'На подписании', 'Подписан', 'Утверждён'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-[#1E3A5F] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-200/50 bg-slate-100/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search Bar + Toggle Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Поиск по приказам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-gray-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/10 focus:border-[#1E3A5F] transition-all bg-white shadow-sm"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all shadow-sm ${
                filtersOpen || selectedTypes.length > 0
                  ? 'bg-[#1E3A5F]/10 border-[#1E3A5F]/30 text-[#1E3A5F]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Фильтры</span>
              <If is={selectedTypes.length > 0}>
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
                <div className="pt-2">
                  <OrderFilters
                    selectedTypes={selectedTypes}
                    onTypeToggle={handleTypeToggle}
                    onReset={() => setSelectedTypes([])}
                  />
                </div>
              </motion.div>
            </If>
          </AnimatePresence>
        </div>

        {/* List */}
        <OrderList
          orders={filteredOrders}
          onOrderClick={setSelectedExtOrder}
        />
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
