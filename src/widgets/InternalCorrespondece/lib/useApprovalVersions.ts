import { useMemo } from "react";
import {
  buildApprovalVersionWarning,
  extractApprovalVersionSummary,
  getApprovedCountByVersion,
} from "@entities/correspondence";

interface IVersionOption {
  id: string | number;
  versionNumber?: string | number | null;
  is_selected?: boolean;
}

const versionLabelOf = (version?: IVersionOption | null) =>
  version?.versionNumber ? `Версия ${version.versionNumber}` : null;

/**
 * Учёт версий при согласовании: сводка с бэкенда, версия, которую пользователь
 * согласует прямо сейчас (открытая в редакторе), и предупреждение о том, что
 * остальные согласующие одобрили другую версию.
 */
export const useApprovalVersions = (
  workflowSource: unknown,
  versions: IVersionOption[],
  activeVersionId: string | number | null,
) => {
  const approvalVersionSummary = useMemo(
    () => extractApprovalVersionSummary(workflowSource),
    [workflowSource],
  );

  const approvalVersionLabel = useMemo(() => {
    if (activeVersionId == null) return null;
    return versionLabelOf(
      versions.find((item) => String(item.id) === String(activeVersionId)),
    );
  }, [versions, activeVersionId]);

  const approvalVersionWarning = useMemo(
    () =>
      buildApprovalVersionWarning(
        approvalVersionSummary,
        activeVersionId,
        approvalVersionLabel,
      ),
    [approvalVersionSummary, activeVersionId, approvalVersionLabel],
  );

  // Подписывающий подписывает версию, выбранную для подписи, а не открытую в
  // редакторе — предупреждение для него считаем по ней.
  const signVersionWarning = useMemo(() => {
    const selected = versions.find((item) => item.is_selected);
    return buildApprovalVersionWarning(
      approvalVersionSummary,
      selected?.id ?? null,
      versionLabelOf(selected),
    );
  }, [approvalVersionSummary, versions]);

  const approvedCountByVersion = useMemo(
    () => getApprovedCountByVersion(approvalVersionSummary),
    [approvalVersionSummary],
  );

  return {
    approvalVersionSummary,
    approvalVersionWarning,
    signVersionWarning,
    approvedCountByVersion,
  };
};
