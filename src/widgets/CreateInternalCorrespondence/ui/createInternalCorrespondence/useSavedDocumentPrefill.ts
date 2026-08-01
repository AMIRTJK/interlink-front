import { useEffect, type Dispatch, type SetStateAction } from "react";

import { mapServerAttachment } from "../../lib/utils";
import type {
  Approver,
  AttachedFile,
  FinalSigner,
  ImportanceLevel,
  RecipientOption,
} from "../../types";
import {
  approverFromApproval,
  finalSignerFromCreator,
  finalSignerFromSignature,
  pickActiveSignature,
  recipientFromUser,
} from "./documentPrefillMappers";

interface IParams {
  id?: string | number;
  initialData: any;
  setSubject: Dispatch<SetStateAction<string>>;
  setImportance: Dispatch<SetStateAction<ImportanceLevel>>;
  setLetterType: Dispatch<SetStateAction<string | null>>;
  setTo: Dispatch<SetStateAction<RecipientOption[]>>;
  setCc: Dispatch<SetStateAction<RecipientOption[]>>;
  setShowCcField: Dispatch<SetStateAction<boolean>>;
  setApprovers: Dispatch<SetStateAction<Approver[]>>;
  setAttachments: Dispatch<SetStateAction<AttachedFile[]>>;
  setDocCreator: Dispatch<SetStateAction<any>>;
  setFinalSigner: Dispatch<SetStateAction<FinalSigner | null>>;
  setStampVisible: Dispatch<SetStateAction<boolean>>;
}

/** Наполнение формы сохранённым письмом: реквизиты, получатели, согласующие,
 * вложения, автор и подписывающий. */
export const useSavedDocumentPrefill = ({
  id,
  initialData,
  setSubject,
  setImportance,
  setLetterType,
  setTo,
  setCc,
  setShowCcField,
  setApprovers,
  setAttachments,
  setDocCreator,
  setFinalSigner,
  setStampVisible,
}: IParams) => {
  useEffect(() => {
    if (initialData?.item) {
      const item = initialData.item;

      if (item.subject) setSubject(item.subject);

      // ВАЖНО: тело письма в редактор грузит ТОЛЬКО эффект истории версий
      // (по allVersions). Если дублировать загрузку здесь, этот эффект
      // срабатывает после пагинации и перезаписывает innerHTML, стирая
      // распорки между страницами — текст «сползает» в зазор после обновления.

      // priority и document_type приходят уже в ключах бэкенда — кладём как есть
      if (item.priority) setImportance(item.priority);
      if (item.document_type) setLetterType(item.document_type);

      if (item.recipients && Array.isArray(item.recipients)) {
        const toUsers: RecipientOption[] = [];
        const ccUsers: RecipientOption[] = [];
        item.recipients.forEach((r: any) => {
          if (!r.user) return;
          const mappedUser = recipientFromUser(r.user);
          if (r.type === "to") toUsers.push(mappedUser);
          if (r.type === "cc") ccUsers.push(mappedUser);
        });
        if (toUsers.length > 0) setTo(toUsers);
        if (ccUsers.length > 0) {
          setCc(ccUsers);
          setShowCcField(true);
        }
      }

      if (item.approvals && Array.isArray(item.approvals)) {
        setApprovers(item.approvals.map(approverFromApproval));
      }

      // Уже сохранённые вложения. Файлы, выбранные пользователем прямо сейчас,
      // оставляем: письмо перезапрашивается и после посторонних действий,
      // и такой рефетч не должен съедать несохранённый выбор.
      if (Array.isArray(item.attachments)) {
        setAttachments((prev) => [
          ...item.attachments.map((a: any) =>
            mapServerAttachment(a, item.id || id),
          ),
          ...prev.filter((a) => a.file),
        ]);
      }

      if (item.creator) {
        setDocCreator(item.creator);
      }

      if (item.signatures && item.signatures.length > 0) {
        const s = pickActiveSignature(item.signatures);
        setFinalSigner(finalSignerFromSignature(s));
        if (s.status === "signed") {
          setStampVisible(false);
        }
      } else if (item.creator) {
        setFinalSigner(finalSignerFromCreator(item.creator));
      }
    }
  }, [initialData]);
};
