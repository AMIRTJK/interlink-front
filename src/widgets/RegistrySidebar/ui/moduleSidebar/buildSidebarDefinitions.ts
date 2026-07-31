import { AppRoutes } from "@shared/config";
import { sideBarIcons } from "../../lib/sidebarIcons";
import { SYSTEM_FOLDERS } from "../../lib/constants";

interface IParams {
  counts: Record<string, any>;
  isInternal: boolean;
  systemFoldersKeys: string[];
}

/** Дефолтные ключи на случай, если бэкенд ещё не прислал массив system. */
export const DEFAULT_FOLDER_KEYS = ["inbox", "sent", "drafts", "trash"];

export const buildSidebarDefinitions = ({
  counts,
  isInternal,
  systemFoldersKeys,
}: IParams): Record<string, any> => {
  const baseMap: Record<string, any> = {
    inbox: {
      title: SYSTEM_FOLDERS.INCOMING,
      key: isInternal
        ? AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING
        : AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING,
      icon: sideBarIcons.incomingIcon,
      count: counts.incoming_total,
      path: isInternal
        ? AppRoutes.CORRESPONDENCE_INTERNAL_INCOMING
        : AppRoutes.CORRESPONDENCE_EXTERNAL_INCOMING,
    },
    sent: {
      title: SYSTEM_FOLDERS.OUTGOING,
      key: isInternal
        ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
        : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
      icon: sideBarIcons.outgoingIcon,
      count: counts.outgoing_total,
      path: isInternal
        ? AppRoutes.CORRESPONDENCE_INTERNAL_OUTGOING
        : AppRoutes.CORRESPONDENCE_EXTERNAL_OUTGOING,
    },
    drafts: {
      title: SYSTEM_FOLDERS.DRAFTS,
      key: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
      icon: sideBarIcons.draftIcon,
      count: isInternal ? counts.drafts : counts.drafts_total || 0,
      path: AppRoutes.CORRESPONDENCE_INTERNAL_DRAFTS,
    },

    trash: {
      title: SYSTEM_FOLDERS.TRASH,
      key: isInternal
        ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
        : AppRoutes.CORRESPONDENCE_TRASHED,
      icon: sideBarIcons.garbageIcon,
      count: isInternal ? counts.trash : counts.trash_total,
      path: isInternal
        ? AppRoutes.CORRESPONDENCE_INTERNAL_TRASHED
        : AppRoutes.CORRESPONDENCE_TRASHED,
    },
  };

  const finalDefinitions: Record<string, any> = {};

  systemFoldersKeys.forEach((key) => {
    const def = baseMap[key];
    if (def) {
      finalDefinitions[def.title] = {
        key: def.key,
        icon: def.icon,
        count: def.count,
        path: def.path,
        slug: key, // Добавляем оригинальный ключ (inbox, sent и т.д.)
      };
    }
  });

  return finalDefinitions;
};
