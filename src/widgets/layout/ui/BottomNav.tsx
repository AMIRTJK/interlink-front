import { ModuleMenu } from "./ModuleMenu";

/**
 * Нижняя навигационная панель личного кабинета (режим «Нижнее меню»).
 *
 * Содержит только иконки модулей и их названия. Все остальные элементы
 * интерфейса (логотип, пользователь, системные кнопки) остаются в верхнем хедере.
 */
export const BottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 z-[90] h-14 border-t border-white/20 dark:border-zinc-700/30 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 transition-all duration-300 ease-in-out">
    <div className="h-full px-4 flex items-center justify-center">
      <ModuleMenu variant="header" navLayout="bottom" />
    </div>
  </div>
);
