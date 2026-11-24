import { Lock, LogOut, UserCog } from "lucide-react";
import { HeaderMenu } from "./HeaderMenu";
import { HeaderMenuItem } from "./HeaderMenuItem";
import { HEADER_MENU_LABELS } from "./headerModel";

interface IProps {
  onLock: () => void;
  onLogout: () => void;
}

const ICON_PROPS = { size: 18, strokeWidth: 2.2 } as const;

/** Меню «Сеанс»: блокирование и выход. Пункт закрывает меню перед своим экраном. */
export const HeaderSessionMenu = ({ onLock, onLogout }: IProps) => (
  <HeaderMenu
    label={HEADER_MENU_LABELS.session}
    icon={<UserCog {...ICON_PROPS} />}
  >
    {({ close }) => (
      <>
        <HeaderMenuItem
          icon={<Lock {...ICON_PROPS} />}
          label="Блокирование"
          onClick={() => {
            close();
            onLock();
          }}
        />
        <HeaderMenuItem
          icon={<LogOut {...ICON_PROPS} />}
          label="Выход"
          isDanger
          onClick={() => {
            close();
            onLogout();
          }}
        />
      </>
    )}
  </HeaderMenu>
);
