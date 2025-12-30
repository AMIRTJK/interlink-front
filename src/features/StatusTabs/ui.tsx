import React from "react";
import { Tabs, Badge } from "antd";
import "./style.css";

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const TABS: TabItem[] = [
  { id: "inbox", label: "Входящие", count: 32 },
  { id: "registration", label: "На регистрации" },
  { id: "review", label: "На визировании", count: 4 },
  { id: "execution", label: "На исполнение" },
  { id: "approval", label: "На согласовании" },
  { id: "signing", label: "На подпись" },
];

export const StatusTabs = ({ activeTab, onTabChange }: StatusTabsProps) => {
  const items = TABS.map((tab) => ({
    key: tab.id,
    label: (
      <span className="status-tab-label">
        {tab.label}
        {tab.count !== undefined && (
          <Badge
            count={tab.count}
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
        animated={false}
      />
    </div>
  );
};
