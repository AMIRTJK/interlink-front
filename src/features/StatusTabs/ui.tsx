import { Badge } from "antd";
import { motion } from "framer-motion";
import { useTheme } from "@shared/lib";
import { If } from "@shared/ui";
import "./style.css";
import { CorrespondenseStatus } from "@entities/correspondence";

interface ITabItem {
  id: string;
  label: string;
}

interface IStatusTabs {
  activeTab: string;
  onTabChange: (id: string) => void;
  counts?: Record<string, number>;
  layoutId?: string;
}

const TABS: ITabItem[] = [
  { id: CorrespondenseStatus.DRAFT, label: "Черновик" },
  { id: CorrespondenseStatus.TO_REGISTER, label: "Регистрация" },
  { id: CorrespondenseStatus.TO_VISA, label: "Визирование" },
  { id: CorrespondenseStatus.TO_EXECUTE, label: "Исполнение" },
  { id: CorrespondenseStatus.TO_APPROVE, label: "Согласование" },
  { id: CorrespondenseStatus.TO_SIGN, label: "Подпись" },
  { id: CorrespondenseStatus.DONE, label: "Завершено" },
  { id: CorrespondenseStatus.CANCELLED, label: "Отменено" },
];

export const StatusTabs = ({
  activeTab,
  onTabChange,
  counts,
  layoutId = "active-tab",
}: IStatusTabs) => {
  const { isAnimEnabled } = useTheme();

  return (
    <div className="status-tabs">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`status-tab ${isActive ? "status-tab--active" : ""}`}
          >
            <If is={isActive}>
              <motion.div
                layoutId={isAnimEnabled ? layoutId : undefined}
                className="status-tab-background"
                transition={
                  isAnimEnabled
                    ? { type: "spring", bounce: 0, duration: 0.4 }
                    : { duration: 0 }
                }
              />
            </If>

            <span className="status-tab-text">
              <span className="status-tab-label">
                {tab.label}
                {counts?.[tab.id] !== undefined && (
                  <Badge
                    count={counts[tab.id]}
                    className="status-tab-badge"
                    overflowCount={999}
                  />
                )}
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
