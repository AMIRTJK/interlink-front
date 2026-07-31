import { STAMP_ATTR } from "../../lib/constants";
import { splitDocLayout } from "./docLayout";

// Версии, подпись под которыми отозвана: бэкенд помечает отзыв в самой подписи
// (или в её payload_json), а не в записи версии.
export const collectRevokedVersionIds = (signatures: any[]) => {
  const ids = new Set<number | string>();
  signatures.forEach((s: any) => {
    if (s.status === "revoked") {
      if (s.version_id) ids.add(s.version_id);
      if (s.payload_json?.version_id) ids.add(s.payload_json.version_id);
    }
  });
  return ids;
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
}: IMapVersionsParams) =>
  rawVersions.map((v: any, idx: number) => {
    const isExplicitRevoked =
      v.signature_state === "revoked" ||
      revokedVersionIds.has(v.id) ||
      (v.parent_id && revokedVersionIds.has(v.parent_id)) ||
      (!hasSignedWorkflowSignature &&
        typeof v.body === "string" &&
        v.body.includes(STAMP_ATTR));

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
