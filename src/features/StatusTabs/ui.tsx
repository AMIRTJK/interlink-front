import { Badge } from "antd";
import { Tabs } from "@shared/ui";
import "./style.css";

interface ITabItem {
  id: string;
  label: string;
}

interface IStatusTabs {
  activeTab: string;
  onTabChange: (id: string) => void;
  counts?: Record<string, number>;
}

const TABS: ITabItem[] = [
  { id: "inbox", label: "Входящие" },
  { id: "registration", label: "На регистрации" },
  { id: "review", label: "На визировании" },
  { id: "execution", label: "На исполнение" },
  { id: "approval", label: "На согласовании" },
  { id: "signing", label: "На подпись" },
];


export const StatusTabs = ({ activeTab, onTabChange, counts }: IStatusTabs) => {
  const items = TABS.map((tab) => ({
    key: tab.id,
    label: (
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
    ),
  }));

  return (
    <div className="status-tabs-wrapper">
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={items}
        className="custom-chrome-tabs"
      />
    </div>
  );
};
