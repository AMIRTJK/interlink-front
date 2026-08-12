import {
  APPROVED_STATUS,
  IApprovalVersionDecision,
  IApprovalVersionGroup,
  IApprovalVersionSource,
  IApprovalVersionSummary,
  IApprovalVersionWarning,
  UNKNOWN_VERSION_LABEL,
} from "./model";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

/**
 * Достаёт `approval_version_summary` из ответа бэкенда: сводка приходит и в
 * `show`, и в `workflow`, и в `versions`, а обёртка вокруг неё различается
 * (`data`, `data.item`, либо объект отдан напрямую).
 */
export const extractApprovalVersionSummary = (
  source: unknown,
): IApprovalVersionSummary | null => {
  const root = asRecord(source);
  if (!root) return null;

  const data = asRecord(root.data);
  const candidates = [root, data, asRecord(root.item), data && asRecord(data.item)];

  for (const candidate of candidates) {
    const summary = candidate?.approval_version_summary;
    if (summary && typeof summary === "object") {
      return summary as IApprovalVersionSummary;
    }
  }

  return null;
};

/** «Версия 3.0» — из номера версии, а при его отсутствии из id. */
export const formatApprovalVersionLabel = (
  source: IApprovalVersionSource | null | undefined,
): string | null => {
  const number = source?.version_number || source?.version;
  if (number) return `Версия ${number}`;
  if (source?.version_id != null) return `Версия #${source.version_id}`;
  return null;
};

const sameVersion = (
  left: number | string | null | undefined,
  right: number | string | null | undefined,
) => left != null && right != null && String(left) === String(right);

/**
 * Версия, на которой принято конкретное решение. `/workflow` кладёт её прямо в
 * запись согласования, остальные ручки — только в сводку, поэтому читаем оба
 * источника. `null` — версия неизвестна (старое согласование или не решено).
 */
export const resolveApprovalVersionLabel = (
  approval: IApprovalVersionSource | null | undefined,
  summary?: IApprovalVersionSummary | null,
): string | null => {
  if (!approval) return null;
  if (approval.status && approval.status !== APPROVED_STATUS) return null;

  const inline = formatApprovalVersionLabel(approval);
  if (inline) return inline;

  const approvalId = approval.approval_id ?? approval.id;
  const decision = (summary?.approvers || []).find((item) =>
    sameVersion(item.approval_id, approvalId),
  );

  return formatApprovalVersionLabel(decision);
};

/** Id версии, на которой принято решение, из записи согласования или сводки. */
export const resolveApprovalVersionId = (
  approval: IApprovalVersionSource | null | undefined,
  summary?: IApprovalVersionSummary | null,
): number | string | null => {
  if (approval?.version_id != null) return approval.version_id;

  const approvalId = approval?.approval_id ?? approval?.id;
  const decision = (summary?.approvers || []).find((item) =>
    sameVersion(item.approval_id, approvalId),
  );

  return decision?.version_id ?? null;
};

/** Сколько согласующих одобрили каждую версию: ключ — id версии строкой. */
export const getApprovedCountByVersion = (
  summary?: IApprovalVersionSummary | null,
): Map<string, number> => {
  const counts = new Map<string, number>();
  if (!summary) return counts;

  (summary.versions || []).forEach((version) => {
    if (version.version_id == null) return;
    counts.set(String(version.version_id), version.approved_count || 0);
  });

  // Сводка версий может не содержать записи для версии без согласований —
  // добираем счётчик по самим решениям, чтобы бейджи не расходились.
  (summary.approvers || []).forEach((decision) => {
    if (decision.status !== APPROVED_STATUS || decision.version_id == null) return;
    const key = String(decision.version_id);
    if (!counts.has(key)) counts.set(key, 0);
  });

  return counts;
};

const buildGroups = (
  decisions: IApprovalVersionDecision[],
): IApprovalVersionGroup[] => {
  const groups = new Map<string, IApprovalVersionGroup>();

  decisions.forEach((decision) => {
    const key = decision.version_id == null ? "unknown" : String(decision.version_id);
    const group = groups.get(key) || {
      versionId: decision.version_id ?? null,
      label: formatApprovalVersionLabel(decision) || UNKNOWN_VERSION_LABEL,
      count: 0,
      approverNames: [],
    };

    group.count += 1;
    const name = decision.approver?.full_name;
    if (name) group.approverNames.push(name);
    groups.set(key, group);
  });

  return [...groups.values()].sort((a, b) => b.count - a.count);
};

/**
 * Готовит предупреждение перед согласованием: сравнивает версию, которую видит
 * пользователь, с версиями, уже одобренными другими согласующими. Считаем на
 * клиенте, потому что бэкенд считает `has_version_mismatch` только для версии,
 * выбранной для подписи, а согласовать можно и другую открытую версию.
 */
export const buildApprovalVersionWarning = (
  summary: IApprovalVersionSummary | null | undefined,
  targetVersionId?: number | string | null,
  targetVersionLabel?: string | null,
): IApprovalVersionWarning | null => {
  if (!summary) return null;

  const target = targetVersionId ?? summary.selected_version?.version_id ?? null;
  if (target == null) return null;

  const approved = (summary.approvers || []).filter(
    (decision) => decision.status === APPROVED_STATUS,
  );
  if (approved.length === 0) return null;

  const matched = approved.filter((decision) =>
    sameVersion(decision.version_id, target),
  );
  const others = approved.filter(
    (decision) => !sameVersion(decision.version_id, target),
  );

  const knownLabel =
    targetVersionLabel ||
    formatApprovalVersionLabel(
      (summary.versions || []).find((version) =>
        sameVersion(version.version_id, target),
      ),
    ) ||
    formatApprovalVersionLabel(matched[0]) ||
    formatApprovalVersionLabel(summary.selected_version) ||
    `Версия #${target}`;

  return {
    hasMismatch: others.length > 0,
    targetLabel: knownLabel,
    matchedCount: matched.length,
    mismatchedCount: others.length,
    groups: buildGroups(others),
  };
};
