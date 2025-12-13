import { Menu } from "antd";
import type { MenuProps } from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  FileTextOutlined,
  MailOutlined,
  FileDoneOutlined,
  ExceptionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import "./style.css";

type MenuItem = Required<MenuProps>["items"][number];

const moduleItems: MenuItem[] = [
  {
    key: "personal",
    label: "Личный кабинет",
    icon: <UserOutlined style={{ fontSize: "40px" }} />,
  },
  {
    key: "organization",
    label: "Организация",
    icon: <SettingOutlined style={{ fontSize: "40px" }} />,
  },
  {
    key: "documents_main",
    label: "Основные документы",
    icon: <FileTextOutlined style={{ fontSize: "40px" }} />,
  },
  {
    key: "correspondence",
    label: "Корреспонденция",
    icon: <MailOutlined style={{ fontSize: "40px" }} />,
  },
  {
    key: "documents_primary",
    label: "Первичные документы",
    icon: <FileDoneOutlined style={{ fontSize: "40px" }} />,
  },
  {
    key: "applications",
    label: "Заявки",
    icon: <ExceptionOutlined style={{ fontSize: "40px" }} />,
  },
  {
    key: "crm",
    label: "CRM",
    icon: <HomeOutlined style={{ fontSize: "40px" }} />,
  },
];

export const ModuleMenu = () => {
  const [current, setCurrent] = useState("personal");

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
    // Здесь должна быть ваша логика navigate, например:
    // navigate(`/module/${e.key}`);
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={moduleItems}
      theme="light"
      disabledOverflow
      className="module-grid-menu flex-wrap p-2 border-b-0!"
    />
  );
};
