import { useState } from "react";
import { TTab } from "../model";
import { TModalType, TModalConfig } from "./drawerActionsModalModel";
import { ISearchItem } from "@shared/ui/SmartSearchModal";
import { ApiRoutes } from "@shared/api";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";
import { correspondencePermissionsKey } from "@entities/correspondence";
import { useModalState, useGetQuery, useMutationQuery } from "@shared/lib/hooks";

interface UseDrawerActionsModalStateParams {
  docId?: string;
  onRefresh?: () => void;
  onClose: () => void;
  onOpenAssignment?: () => void;
}

export const useDrawerActionsModalState = ({
  docId,
  onRefresh,
  onClose,
  onOpenAssignment,
}: UseDrawerActionsModalStateParams) => {
  const [activeTab, setActiveTab] = useState<TTab>("actions");

  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useModalState();
  const [activeModalType, setActiveModalType] = useState<TModalType | null>(null);

  const [viewAllSection, setViewAllSection] = useState<string | null>(null);

  const [selectedItems, setSelectedItems] = useState<ISearchItem[]>([]);
  const [selectedSigners, setSelectedSigners] = useState<ISearchItem[]>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<ISearchItem[]>([]);
  const [showVisorNotice, setShowVisorNotice] = useState(false);

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
  });

  const { data: visorsData } = useGetQuery({
    url: docId ? ApiRoutes.INTERNAL_VISORS.replace(":id", String(docId)) : "",
    useToken: true,
    options: { enabled: !!docId },
  });

  const visorsList: any[] =
    visorsData?.data?.visors ||
    visorsData?.data?.data ||
    (Array.isArray(visorsData?.data) ? visorsData.data : []);

  const handleAssignmentClick = () => {
    if (docId && visorsList.length === 0) {
      setShowVisorNotice(true);
      return;
    }
    onOpenAssignment?.();
  };

  const { mutate: inviteSigner } = useMutationQuery({
    url: docId ? ApiRoutes.INTERNAL_INVITE_SIGNER.replace(":id", docId) : "",
    method: "POST",
    messages: {
      success: "Подписывающий назначен",
      invalidate: docId
        ? [
            ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", docId),
            ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", docId),
            correspondencePermissionsKey(docId),
            ...CORRESPONDENCE_INVALIDATE_KEYS,
          ]
        : [...CORRESPONDENCE_INVALIDATE_KEYS],
    },
  });

  const { mutate: attachIncoming } = useMutationQuery({
    url: docId ? ApiRoutes.ATTACH_INTERNAL_INCOMING.replace(":id", docId) : "",
    method: "POST",
    messages: {
      success: "Письмо прикреплено",
      invalidate: docId
        ? [
            ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", docId),
            ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", docId),
            ...CORRESPONDENCE_INVALIDATE_KEYS,
          ]
        : [...CORRESPONDENCE_INVALIDATE_KEYS],
    },
  });

  const { mutate: inviteApprover } = useMutationQuery({
    url: docId ? ApiRoutes.INTERNAL_INVITE_APPROVER.replace(":id", docId) : "",
    method: "POST",
    messages: {
      success: "Согласующий приглашен",
      invalidate: docId
        ? [
            ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", docId),
            ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", docId),
            correspondencePermissionsKey(docId),
            ...CORRESPONDENCE_INVALIDATE_KEYS,
          ]
        : [...CORRESPONDENCE_INVALIDATE_KEYS],
    },
  });

  const handleOpenModal = (type: TModalType) => {
    setActiveModalType(type);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
  };

  const handleConfirm = (_ids: string[], items: ISearchItem[]) => {
    const addUniqueItems = (prev: ISearchItem[], newItems: ISearchItem[]) => {
      const uniqueNew = newItems.filter(
        (newItem) => !prev.some((existing) => existing.id === newItem.id),
      );
      return [...prev, ...uniqueNew];
    };

    if (activeModalType === "attach") {
      setSelectedItems((prev) => addUniqueItems(prev, items));
    } else if (activeModalType === "signer") {
      setSelectedSigners((prev) => addUniqueItems(prev, items));
    } else if (activeModalType === "approvers") {
      setSelectedApprovers((prev) => addUniqueItems(prev, items));
    }
    closeModal();
  };

  const handleSave = () => {
    if (docId) {
      if (selectedSigners.length > 0) {
        const payload = {
          users: selectedSigners.map((s) => s.id),
        };
        inviteSigner(payload);
      }

      if (selectedApprovers.length > 0) {
        const approverIds = selectedApprovers.map((item) => item.id);
        inviteApprover({ users: approverIds });
      }

      const incomingId = selectedItems[0]?.id;
      if (incomingId) {
        attachIncoming({ incoming_id: incomingId });
      }

      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 500);
      }

      setSelectedSigners([]);
      setSelectedApprovers([]);
    } else {
      alert("Ошибка: ID документа не найден. Сначала сохраните черновик.");
    }
    onClose();
  };

  const handleRemoveItem = (id: string, type: string) => {
    if (type === "attach")
      setSelectedItems((prev) => prev.filter((i) => i.id !== id));
    if (type === "signer")
      setSelectedSigners((prev) => prev.filter((i) => i.id !== id));
    if (type === "approvers")
      setSelectedApprovers((prev) => prev.filter((i) => i.id !== id));
  };

  const getViewAllItems = () => {
    if (viewAllSection === "attach") return selectedItems;
    if (viewAllSection === "signer") return selectedSigners;
    if (viewAllSection === "approvers") return selectedApprovers;
    return [];
  };

  const getModalConfig = (): TModalConfig => {
    const transformUser = (items: any[]) =>
      items.map((item) => ({
        id: item.id,
        title: item.full_name || `${item.last_name} ${item.first_name}`,
        subtitle: item.position || "Сотрудник",
        tag: item.position || "Сотрудник",
      }));

    switch (activeModalType) {
      case "attach":
        return {
          title: "Прикрепить письмо",
          mode: "attach" as const,
          querySettings: {
            url: ApiRoutes.GET_INTERNAL_INCOMING_PICKER as string,
          },
          transformResponse: (items: any[]) =>
            items.map((item) => {
              const creator = usersData?.data?.data.find(
                (user: any) => user.id === item.creator_id,
              );
              return {
                id: item.id,
                title: item.subject || "Без темы",
                subtitle: creator?.full_name || "Не указано",
                reg_number: item.reg_number
                  ? item.reg_number.replace(/^[A-Z]+/i, item.my_prefix || "IN")
                  : "Не указано",
                date: item.sent_at,
                tag: "Входящее",
              };
            }),
          multiple: true,
        };
      case "signer":
        return {
          title: "Выбрать подписывающих",
          mode: "select" as const,
          querySettings: {
            url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS as string,
          },
          transformResponse: transformUser,
          multiple: true,
        };
      case "approvers":
        return {
          title: "Выбрать согласующих",
          mode: "select" as const,
          querySettings: {
            url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS as string,
          },
          transformResponse: transformUser,
          multiple: true,
        };
      default:
        return {
          title: "",
          mode: "select" as const,
          querySettings: { url: "" },
          multiple: false,
        };
    }
  };

  return {
    activeTab,
    setActiveTab,
    isModalOpen,
    activeModalType,
    viewAllSection,
    setViewAllSection,
    selectedItems,
    selectedSigners,
    selectedApprovers,
    showVisorNotice,
    setShowVisorNotice,
    handleAssignmentClick,
    handleOpenModal,
    handleCloseModal,
    handleConfirm,
    handleSave,
    handleRemoveItem,
    getViewAllItems,
    getModalConfig,
  };
};
