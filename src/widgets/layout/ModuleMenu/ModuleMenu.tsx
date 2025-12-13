import { Menu } from "antd";
import type { MenuProps } from "antd";

import { useState } from "react";
import "./style.css";

import ProfileIcon from "../../../assets/icons/profile-icon.svg";
import OrganizationIcon from "../../../assets/icons/organization-icon.svg";
import MainDocumentsIcon from "../../../assets/icons/main-documents-icon.svg";
import CorrespondenceIcon from "../../../assets/icons/correspondence-icon.svg";
import PrimaryDocumentsIcon from "../../../assets/icons/primary documents-icon.svg";
import ApplicationsIcon from "../../../assets/icons/applications-icon.svg";
import CrmIcon from "../../../assets/icons/crm-icon.svg";

type MenuItem = Required<MenuProps>["items"][number];

const moduleItems: MenuItem[] = [
  {
    key: "personal",
    label: "Личный кабинет",
    icon: <img src={ProfileIcon} />,
  },
  {
    key: "organization",
    label: "Организация",
    icon: <img src={OrganizationIcon} />,
  },
  {
    key: "documents_main",
    label: "Основные документы",
    icon: <img src={MainDocumentsIcon} />,
  },
  {
    key: "correspondence",
    label: "Корреспонденция",
    icon: <img src={CorrespondenceIcon} />,
  },
  {
    key: "documents_primary",
    label: "Первичные документы",
    icon: <img src={PrimaryDocumentsIcon} />,
  },
  {
    key: "applications",
    label: "Заявки",
    icon: <img src={ApplicationsIcon} />,
  },
  {
    key: "crm",
    label: "CRM",
    icon: <img src={CrmIcon} />,
  },
];

export const ModuleMenu = () => {
  const [current, setCurrent] = useState("personal");

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
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
