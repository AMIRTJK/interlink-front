import { STAMP_ATTR } from "../../lib/constants";
import { splitDocLayout } from "./docLayout";

// Версии, подпись под которыми отозвана: бэкенд помечает отзыв в самой подписи
// (или в её payload_json), а не в записи версии.
export const collectRevokedVersionIds = (signatures: any[]) => {
  const ids = new Set<number | string>();
  signatures.forEach((s: any) => {
    if (s.status === "revoked") {
      if (s.version_id) {
        ids.add(s.version_id);
        ids.add(String(s.version_id));
        ids.add(Number(s.version_id));
      }
      if (s.payload_json?.version_id) {
        ids.add(s.payload_json.version_id);
        ids.add(String(s.payload_json.version_id));
        ids.add(Number(s.payload_json.version_id));
      }
    }
  });
  return ids;
};

// Функция сливает версии-дубликаты, созданные бэкендом при подписании (например, 1.5 для 1.2),
// подставляя body с печатью в родительскую подписанную версию (1.2) и скрывая дубликат (1.5).
export const mergeSignedDuplicateVersions = (rawVersions: any[]): any[] => {
  if (!Array.isArray(rawVersions) || rawVersions.length === 0) {
    return rawVersions;
  }

  const duplicatesToRemove = new Set<number | string>();
  const parentUpdates = new Map<number | string, Partial<any>>();

  rawVersions.forEach((v: any) => {
    if (!v.parent_id) return;

    const parent = rawVersions.find((p: any) => p.id === v.parent_id);
    if (!parent) return;

    const isParentSignedOrRevoked =
      parent.is_current_signed ||
      parent.signature_state === "signed" ||
      parent.signature_state === "revoked" ||
      Boolean(parent.signature_signed_at) ||
      Boolean(parent.signature_revoked_at);

    if (!isParentSignedOrRevoked) return;

    const isSameTimestamp =
      (Boolean(parent.signature_signed_at) &&
        v.created_at === parent.signature_signed_at) ||
      (Boolean(parent.signature_revoked_at) &&
        v.created_at === parent.signature_revoked_at);

    const hasStampInBody =
      typeof v.body === "string" && v.body.includes(STAMP_ATTR);

    if (isSameTimestamp || hasStampInBody) {
      duplicatesToRemove.add(v.id);

      const existingUpdate = parentUpdates.get(parent.id) || {};
      parentUpdates.set(parent.id, {
        ...existingUpdate,
        body: v.body || parent.body,
        ...(v.is_selected ? { is_selected: true } : {}),
      });
    }
  });

  if (duplicatesToRemove.size === 0) {
    return rawVersions;
  }

  return rawVersions
    .filter((v: any) => !duplicatesToRemove.has(v.id))
    .map((v: any) => {
      const update = parentUpdates.get(v.id);
      return update ? { ...v, ...update } : v;
    });
};

interface IMapVersionsParams {
  rawVersions: any[];
  revokedVersionIds: Set<number | string>;
  hasSignedWorkflowSignature: boolean;
}

// Приведение версий с бэкенда к форме, которую ждут панель версий, редактор и
// сравнение версий.
export const mapDocumentVersions = ({
  rawVersions,
  revokedVersionIds,
  hasSignedWorkflowSignature,
}: IMapVersionsParams) => {
  const mergedVersions = mergeSignedDuplicateVersions(rawVersions);

  return mergedVersions.map((v: any, idx: number) => {
    const isExplicitRevoked =
      v.signature_state === "revoked" ||
      revokedVersionIds.has(v.id) ||
      revokedVersionIds.has(String(v.id)) ||
      revokedVersionIds.has(Number(v.id));

    // Маркер раскладки снимаем здесь, на границе с бэкендом: ниже по коду
    // `content` уходит и в редактор, и в пагинатор, и в сравнение версий —
    // везде он должен быть чистым телом письма.
    const { layout, body } = splitDocLayout(v.body);

    return {
      id: v.id,
      parent_id: v.parent_id,
      versionNumber: v.version || idx + 1,
      content: body,
      layout,
      date: v.created_at,
      author: v.author
        ? {
            id: String(v.author.id),
            name: v.author.full_name || "Неизвестный автор",
            position: v.author.position || "Сотрудник",
            initials: (v.author.full_name || "НА")
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join(""),
          }
        : {
            id: "unknown",
            name: "Неизвестный автор",
            position: "Сотрудник",
            initials: "НА",
          },
      is_selected: v.is_selected,
      is_current_signed: v.is_current_signed && !isExplicitRevoked,
      signature_state: isExplicitRevoked ? "revoked" : v.signature_state,
      signature_revoked_at: v.signature_revoked_at,
      signature_signed_at: v.signature_signed_at,
    };
  });
};

// Уникальные авторы версий со счётчиком — для выпадающего фильтра панели.
export const buildVersionAuthors = (versions: any[]) => {
  const authorsMap: Record<string, { name: string; count: number }> = {};
  versions.forEach((v: any) => {
    if (!authorsMap[v.author.id]) {
      authorsMap[v.author.id] = { name: v.author.name, count: 0 };
    }
    authorsMap[v.author.id].count += 1;
  });
  return Object.entries(authorsMap).map(([id, meta]) => ({
    id,
    name: meta.name,
    count: meta.count,
  }));
};
