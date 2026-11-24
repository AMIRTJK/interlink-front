import { AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useIsDarkMode, useLogout } from "@shared/lib";
import { Tooltip } from "@shared/ui";
import { DesktopMode } from "../ui";
import { LOCK_TEXTS } from "../lockModel";
import { LOCK_TOOLTIP_Z_INDEX } from "../model";
import { useSessionLock } from "../api/useSessionLock";
import { useLockUser } from "../api/useLockUser";
import { useInertBackground } from "../lib/useInertBackground";
import { useLockPageScroll } from "../lib/useLockPageScroll";
import { UnlockForm } from "./UnlockForm";

/**
 * Единственная точка монтирования экрана блокировки (app/routes/PrivateRoute),
 * а не кнопки раскладок: флаг читается из хранилища при каждой загрузке, и
 * блокировка не зависит от того, какая раскладка (или её отсутствие) на экране.
 * Закрыть экран можно только паролем или выходом из системы — Esc и клик мимо
 * ничего не делают.
 */
export const SessionLockGate = () => {
  const { isLocked, unlock } = useSessionLock();
  const userData = useLockUser();
  const isDark = useIsDarkMode();
  const handleLogout = useLogout();

  useInertBackground(isLocked);
  useLockPageScroll(isLocked);

  const mutedTone = isDark ? "text-white/45" : "text-slate-500";

  return (
    <AnimatePresence>
      {isLocked && (
        <DesktopMode
          userData={userData}
          isDark={isDark}
          headerAction={
            <Tooltip
              title={LOCK_TEXTS.logout}
              placement="bottomRight"
              zIndex={LOCK_TOOLTIP_Z_INDEX}
            >
              <button
                type="button"
                onClick={handleLogout}
                aria-label={LOCK_TEXTS.logout}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 backdrop-blur-xl border cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-400 ${isDark ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-800"}`}
              >
                <LogOut size={18} />
              </button>
            </Tooltip>
          }
        >
          <UnlockForm isDark={isDark} onUnlock={unlock} />
          <p className={`text-[11px] leading-snug tracking-wide px-2 ${mutedTone}`}>
            {LOCK_TEXTS.browserOnlyNotice}
          </p>
        </DesktopMode>
      )}
    </AnimatePresence>
  );
};
