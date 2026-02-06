import { AppRoutes } from "@shared/config";
import type { MenuProps } from "antd";
import ProfileIcon from "../../../../assets/icons/profile-icon.svg";
import OrganizationIcon from "../../../../assets/icons/organization-icon.svg";
import MainDocumentsIcon from "../../../../assets/icons/main-documents-icon.svg";
import CorrespondenceIcon from "../../../../assets/icons/correspondence-icon.svg";
import PrimaryDocumentsIcon from "../../../../assets/icons/primary documents-icon.svg";
import ApplicationsIcon from "../../../../assets/icons/applications-icon.svg";
import CrmIcon from "../../../../assets/icons/crm-icon.svg";

export type MenuItem = Required<MenuProps>["items"][number] & {
  requiredRole?: string[];
};

export const getModuleItems = (
  variant: "horizontal" | "compact" | "modern",
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
    requiredRole: ["correspondence.view"],
    icon:
      variant === "horizontal" ? <img src={CorrespondenceIcon} alt="" /> : null,
    ...((variant === "compact" || variant === "modern") && {
      children: [
        {
          key: AppRoutes.CORRESPONDENCE_INCOMING,
          label: "Внешняя корреспонденция",
          requiredRole: ["correspondence.view"],
          icon:
            variant === "modern" ? (
              <img src={OrganizationIcon} alt="" className="opacity-50" />
            ) : null,
        },
        {
          key: AppRoutes.CORRESPONDENCE_OUTGOING,
          label: "Внутренняя корреспонденция",
          requiredRole: ["internal_correspondence.view"],
          icon:
            variant === "modern" ? (
              <img src={OrganizationIcon} alt="" />
            ) : null,
        },
      ],
    }),
  },
  {
    key: "/modules/temp-docs_primary",
    label: "Первичные документы",
    requiredRole: ["primary_documents.view"],
    icon:
      variant === "horizontal" ? (
        <img src={PrimaryDocumentsIcon} alt="" />
      ) : null,
  },
  {
    key: "/modules/temp-apps",
    label: "Заявки",
    requiredRole: ["apps.view"],
    icon:
      variant === "horizontal" ? <img src={ApplicationsIcon} alt="" /> : null,
  },
  {
    key: "/modules/temp-crm",
    label: "CRM",
    requiredRole: ["crm.view"],
    icon: variant === "horizontal" ? <img src={CrmIcon} alt="" /> : null,
  },
];
