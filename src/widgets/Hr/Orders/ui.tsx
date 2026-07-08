import { useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { If } from "@shared/ui/If";
import { ORDER_STATUS_LABELS, IOrderRecord, TOrderStatus } from "./model";
import { OrderFilters } from "./ui/OrderFilters";
import { OrderList } from "./ui/OrderList";
import { OrderDetailModal } from "./ui/OrderDetailModal";
import { OrderForm } from "./ui/OrderForm";
import { useOrdersLogic } from "./lib";

export const OrdersWidget = () => {
  const {
    orders,
    isLoading,
    createM,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedTypes,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    executorQuery,
    setExecutorQuery,
    ministerFilter,
    setMinisterFilter,
    filtersOpen,
    setFiltersOpen,
    hasActiveFilters,
    statCards,
    filteredOrders,
    handleResetFilters,
    handleTypeToggle,
  } = useOrdersLogic();

  const [selectedExtOrder, setSelectedExtOrder] = useState<IOrderRecord | null>(null);
  const [editingOrder, setEditingOrder] = useState<IOrderRecord | null>(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const onSave = (payload: any) => {
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

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter("Все")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-transparent cursor-pointer ${
                statusFilter === "Все"
                  ? "bg-[#1E3A5F] text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-[#1E3A5F]"
              }`}
            >
              Все
            </button>
            {(["draft", "pending", "signed", "approved"] as TOrderStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border border-transparent cursor-pointer ${
                  statusFilter === s
                    ? "bg-[#1E3A5F] text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-[#1E3A5F]"
                }`}
              >
                {ORDER_STATUS_LABELS[s]}
              </button>
            ))}
          </div>

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
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                filtersOpen || hasActiveFilters
                  ? "bg-[#1E3A5F]/5 border-[#1E3A5F]/30 text-[#1E3A5F]"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Фильтры</span>
              <If is={hasActiveFilters}>
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-1" />
              </If>
            </button>
            <button
              onClick={() => {
                setEditingOrder(null);
                setNewOrderOpen(true);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-900/30 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Добавить</span>
            </button>
          </div>

          <AnimatePresence>
            <If is={filtersOpen}>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
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

        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Загрузка приказов...</div>
        ) : (
          <OrderList
            orders={filteredOrders}
            onOrderClick={setSelectedExtOrder}
          />
        )}
      </div>

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
              title={editingOrder ? `Приказ №${editingOrder.number}` : "Новый приказ"}
              onClose={() => {
                setNewOrderOpen(false);
                setEditingOrder(null);
              }}
              onSave={onSave}
            />
          </motion.div>
        </If>
      </AnimatePresence>
    </div>
  );
};
