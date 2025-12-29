import { AppRoutes } from "@shared/config";
import type { MenuProps } from "antd";

import ProfileIcon from "../../../../assets/icons/profile-icon.svg";
import OrganizationIcon from "../../../../assets/icons/organization-icon.svg";
import MainDocumentsIcon from "../../../../assets/icons/main-documents-icon.svg";
import CorrespondenceIcon from "../../../../assets/icons/correspondence-icon.svg";
import PrimaryDocumentsIcon from "../../../../assets/icons/primary documents-icon.svg";
import ApplicationsIcon from "../../../../assets/icons/applications-icon.svg";
import CrmIcon from "../../../../assets/icons/crm-icon.svg";

export type MenuItem = Required<MenuProps>["items"][number];

export const getModuleItems = (
  variant: "horizontal" | "compact"
): MenuItem[] => [
    {
      key: AppRoutes.PROFILE,
      label: "Личный кабинет",
      icon: variant === "horizontal" ? <img src={ProfileIcon} alt="" /> : null,
    },
    {
      key: "/modules/temp-organization",
      label: "Организация",
      icon:
        variant === "horizontal" ? <img src={OrganizationIcon} alt="" /> : null,
    },
    {
      key: "/modules/temp-docs_main",
      label: "Основные документы",
      icon:
        variant === "horizontal" ? <img src={MainDocumentsIcon} alt="" /> : null,
    },
    {
      key: AppRoutes.CORRESPONDENCE,
      label: "Корреспонденция",
      icon:
        variant === "horizontal" ? <img src={CorrespondenceIcon} alt="" /> : null,
      children:
        variant === "compact"
          ? [
            {
              key: AppRoutes.CORRESPONDENCE_INCOMING,
              label: "Входящие",
            },
            {
              key: AppRoutes.CORRESPONDENCE_OUTGOING,
              label: "Исходящие",
            },
          ]
          : undefined,
    },
    {
      key: "/modules/temp-docs_primary",
      label: "Первичные документы",
      icon:
        variant === "horizontal" ? (
          <img src={PrimaryDocumentsIcon} alt="" />
        ) : null,
    },
    {
      key: "/modules/temp-apps",
      label: "Заявки",
      icon:
        variant === "horizontal" ? <img src={ApplicationsIcon} alt="" /> : null,
    },
    {
      key: "/modules/temp-crm",
      label: "CRM",
      icon: variant === "horizontal" ? <img src={CrmIcon} alt="" /> : null,
    },
  ];
