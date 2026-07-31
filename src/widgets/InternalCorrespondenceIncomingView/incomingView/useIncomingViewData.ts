import { useRef, useEffect } from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
  mapServerAttachment,
  type AttachedFile,
} from "@widgets/CreateInternalCorrespondence";
import { normalizeVisors } from "../model";
import { RegistryItem, ACTION_MENU_ITEMS, VISOR_INVITE_HINT } from "./incomingViewModel";

export function useIncomingViewData(
  item: RegistryItem,
  activeVersionId: number | string | null
) {
  const mappedAttachments: AttachedFile[] = (item.attachments || []).map(
    (att: any) => mapServerAttachment(att, item.id)
  );

  const { data: workflowResponse } = useGetQuery({
    url: item?.id
      ? ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: { enabled: !!item?.id, refetchOnWindowFocus: false },
  });

  const { data: rawStructureData } = useGetQuery<
    Record<string, unknown>,
    { data: any }
  >({
    url: item?.id
      ? ApiRoutes.GET_INTERNAL_STRUCTURE.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: { enabled: !!item?.id, refetchOnWindowFocus: false },
  });

  const relatedDocs = rawStructureData?.data?.related_documents || [];

  const { data: assignmentsData } = useGetQuery({
    url: item?.id
      ? ApiRoutes.INTERNAL_ASSIGNMENTS.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: { enabled: !!item?.id, refetchOnWindowFocus: false },
  });

  const itemAssignments = (item as any).assignments || [];
  const assignmentsCount =
    itemAssignments.length > 0
      ? itemAssignments.length
      : assignmentsData?.data?.items?.length ||
        assignmentsData?.data?.assignments?.length ||
        assignmentsData?.items?.length ||
        (Array.isArray(assignmentsData?.data) ? assignmentsData.data.length : 0);

  const signatures = workflowResponse?.data?.signatures || [];
  const approvals = workflowResponse?.data?.approvals || [];

  const canInviteVisor = item.can_invite_visor === true;
  const canCreateAssignment = item.can_create_assignment !== false;
  const itemVisors = normalizeVisors({ data: item.visors });
  const isVisorsAvailable =
    canInviteVisor || item.is_visor === true || itemVisors.length > 0;

  const { data: visorsResponse, isLoading: loadingVisors } = useGetQuery({
    url: item?.id
      ? ApiRoutes.INTERNAL_VISORS.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: {
      enabled: !!item?.id && isVisorsAvailable,
      refetchOnWindowFocus: false,
    },
  });

  const visors = visorsResponse ? normalizeVisors(visorsResponse) : itemVisors;

  const { mutate: markRead } = useMutationQuery({
    method: "POST",
    url: item?.id
      ? ApiRoutes.READ_INTERNAL.replace(":id", String(item.id))
      : "",
    messages: {
      suppressSuccessToast: true,
      invalidate: [
        ApiRoutes.GET_INTERNAL_INCOMING,
        ApiRoutes.GET_INTERNAL_COUNTERS,
      ],
    },
  });

  const markedReadIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!item?.id || markedReadIdRef.current === item.id) return;
    markedReadIdRef.current = item.id;
    markRead({});
  }, [item?.id, markRead]);

  const { mutate: seenMutate } = useMutationQuery({
    method: "POST",
    url: item?.id
      ? ApiRoutes.ACKNOWLEDGE_INTERNAL.replace(":id", String(item.id))
      : "",
    messages: {
      success: "Вы успешно ознакомились с документом",
      error: "Не удалось отметить ознакомление",
      invalidate: item?.id
        ? [ApiRoutes.INTERNAL_GET_WORKFLOW.replace(":id", String(item.id))]
        : [],
    },
  });

  const isAcknowledged =
    item.is_unread === false ||
    (item.recipients &&
      item.recipients.some(
        (r: any) => r.read_at !== null && r.read_at !== undefined
      ));

  const visibleActionItems = ACTION_MENU_ITEMS.filter(
    (menuItem) => menuItem.id !== "visor" || canInviteVisor
  ).map((menuItem) => ({
    ...menuItem,
    disabled: menuItem.id === "task" && !canCreateAssignment,
    hint:
      menuItem.id === "task" && !canCreateAssignment
        ? VISOR_INVITE_HINT
        : undefined,
  }));

  const { data: versionsResponse, isLoading: loadingVersions } = useGetQuery({
    url: item?.id
      ? ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(item.id))
      : "",
    useToken: true,
    options: { enabled: !!item?.id, refetchOnWindowFocus: false },
  });

  const docVersions: { id?: number | string; body?: string }[] =
    versionsResponse?.data?.versions || [];
  const activeVersion =
    docVersions.find((v) => String(v.id) === String(activeVersionId)) ||
    docVersions.reduce((a, b) => (Number(b?.id) > Number(a?.id) ? b : a), docVersions[0] || {});
  const documentBody = activeVersion?.body || item.body || "";

  const isResolvingBody = !!item?.id && loadingVersions;

  const getInitials = (fullName: string) => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const ccRecipientsList = item.recipients
    ? item.recipients
        .filter((r) => r.type === "cc" && r.user?.full_name)
        .map((r) => r.user?.full_name)
        .join(", ")
    : "";

  const senderName = item.creator?.full_name || "Министерство Финансов";
  const senderInitials = item.creator?.full_name
    ? getInitials(item.creator.full_name)
    : "МФ";
  const inboundNumber = item.reg_number
    ? item.reg_number.replace(/^[A-Z]+/i, item.my_prefix || "IN")
    : item.my_prefix
      ? `${item.my_prefix}`
      : "—";

  const formattedSentDate = item.sent_at
    ? new Date(item.sent_at).toLocaleDateString("ru-RU")
    : "—";

  const acknowledgedUsers = item.acknowledged_users || [];
  const repliedUsers = item.replied_users || [];
  const forwardedUsers = item.forwarded_users || [];

  return {
    mappedAttachments,
    relatedDocs,
    assignmentsCount,
    signatures,
    approvals,
    canInviteVisor,
    canCreateAssignment,
    isVisorsAvailable,
    visors,
    loadingVisors,
    seenMutate,
    isAcknowledged,
    visibleActionItems,
    docVersions,
    documentBody,
    isResolvingBody,
    senderName,
    senderInitials,
    inboundNumber,
    formattedSentDate,
    ccRecipientsList,
    acknowledgedUsers,
    repliedUsers,
    forwardedUsers,
  };
}
