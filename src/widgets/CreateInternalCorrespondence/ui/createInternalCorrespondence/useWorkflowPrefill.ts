import { useEffect, type Dispatch, type SetStateAction } from "react";

import {
  extractApprovalVersionSummary,
  resolveApprovalVersionId,
  resolveApprovalVersionLabel,
} from "@entities/correspondence";
import type { Approver, FinalSigner } from "../../types";
import {
  approverFromWorkflow,
  finalSignerFromSignature,
  pickActiveSignature,
} from "./documentPrefillMappers";

interface IParams {
  rawWorkflowData: any;
  setApprovers: Dispatch<SetStateAction<Approver[]>>;
  setFinalSigner: Dispatch<SetStateAction<FinalSigner | null>>;
  setStampVisible: Dispatch<SetStateAction<boolean>>;
}

/**
 * Актуальный маршрут согласования приходит отдельным запросом и обновляет
 * согласующих и подписывающего поверх данных сохранённого письма: уже
 * известных согласующих дополняем статусом, новых — добавляем в список.
 */
export const useWorkflowPrefill = ({
  rawWorkflowData,
  setApprovers,
  setFinalSigner,
  setStampVisible,
}: IParams) => {
  useEffect(() => {
    if (rawWorkflowData?.data) {
      const wfApprovals = rawWorkflowData.data.approvals || [];
      const wfSignatures = rawWorkflowData.data.signatures || [];

      if (wfApprovals.length > 0) {
        const versionSummary = extractApprovalVersionSummary(rawWorkflowData);

        setApprovers((prev) => {
          const merged = [...prev];
          wfApprovals.forEach((wfA: any) => {
            const user = wfA.approver || wfA.user;
            if (!user) return;
            const versionId = resolveApprovalVersionId(wfA, versionSummary);
            const existingIdx = merged.findIndex(
              (a) =>
                (a.approvalRecordId && String(a.approvalRecordId) === String(wfA.id)) ||
                (!a.approvalRecordId &&
                  a.id === String(user.id) &&
                  (versionId == null || a.versionId == null || String(a.versionId) === String(versionId))),
            );
            if (existingIdx !== -1) {
              merged[existingIdx] = {
                ...merged[existingIdx],
                approvalRecordId: String(wfA.id),
                isInvited: true,
                approved: wfA.status === "approved",
                dsApplied: wfA.status === "approved",
                versionId,
                versionLabel: resolveApprovalVersionLabel(wfA, versionSummary),
              };
            } else {
              merged.push(approverFromWorkflow(wfA, user, versionSummary));
            }
          });
          return merged;
        });
      }

      if (wfSignatures.length > 0) {
        const wfS = pickActiveSignature(wfSignatures);

        if (wfS.user) {
          setFinalSigner(finalSignerFromSignature(wfS));
          if (wfS.status === "signed") {
            setStampVisible(false);
          }
        }
      }
    }
  }, [rawWorkflowData]);
};
