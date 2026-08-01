import { useState, useEffect } from "react";
import type { IAdminUser, IPassportOcrResponse } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery, tokenControl } from "@shared/lib";
import type { IPassportSides } from "../PassportUploadStep";
import {
  applyPassportOcr,
  buildEmployeeFormData,
  mapEmployeeToForm,
  prepareEmployeePayload,
  validateEmployee,
} from "../../lib";
import {
  EMPTY_PASSPORT,
  IPassportMeta,
  PASSPORT_DRAFT_KEY,
  readPassportDraft,
  sideToStored,
} from "./employeeFormModalModel";

interface IUseEmployeeFormModalStateProps {
  open: boolean;
  onClose: () => void;
  employee?: IAdminUser | null;
}

export function useEmployeeFormModalState({
  open,
  onClose,
  employee,
}: IUseEmployeeFormModalStateProps) {
  const isEdit = !!employee?.id;
  const currentUserId = tokenControl.getUserId();
  const isSelf = isEdit && String(employee?.id) === String(currentUserId);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passport, setPassport] = useState<IPassportSides>(EMPTY_PASSPORT);
  const [passportMeta, setPassportMeta] = useState<IPassportMeta | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canProceed = !!passport.front;
  const formVisible = isEdit || showForm;

  const createM = useMutationQuery<FormData>({
    url: ApiRoutes.CREATE_USER,
    method: "POST",
    messages: { success: "Сотрудник создан", invalidate: [ApiRoutes.GET_USERS] },
  });

  const updateM = useMutationQuery<FormData>({
    url: () => ApiRoutes.UPDATE_USER.replace(":id", String(employee?.id)),
    method: "POST",
    messages: {
      success: "Сотрудник обновлён",
      invalidate: isSelf
        ? [
            ApiRoutes.GET_USERS,
            ApiRoutes.AUTH_ME,
            `${ApiRoutes.FETCH_USER_BY_ID}${currentUserId}`,
          ]
        : [ApiRoutes.GET_USERS],
    },
  });

  const ocrM = useMutationQuery<FormData>({
    url: ApiRoutes.PASSPORT_OCR,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      error: "Не удалось загрузить фотографии паспорта",
    },
  });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setShowForm(false);
    setPassportMeta(null);
    if (employee) {
      setPassport(EMPTY_PASSPORT);
      setValues(mapEmployeeToForm(employee));
    } else {
      setValues({});
      setPassport(readPassportDraft());
    }
  }, [open, employee]);

  const handlePassportChange = async (val: IPassportSides) => {
    setPassport(val);
    if (isEdit) return;
    if (!val.front && !val.back) {
      localStorage.removeItem(PASSPORT_DRAFT_KEY);
      return;
    }
    try {
      const [front, back] = await Promise.all([
        sideToStored(val.front),
        sideToStored(val.back),
      ]);
      localStorage.setItem(PASSPORT_DRAFT_KEY, JSON.stringify({ front, back }));
    } catch {
      // ignore quota exceed
    }
  };

  const handleChange = (name: string, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "organization_id") {
        next.department_ids = undefined;
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleProceed = () => {
    if (!passport.front || ocrM.isPending) return;

    const fd = new FormData();
    fd.append("passport_front", passport.front.file);
    if (passport.back) fd.append("passport_back", passport.back.file);

    ocrM.mutate(fd, {
      onSuccess: (data: IPassportOcrResponse) => {
        setPassportMeta({
          passport_front_path: data?.passport_front_path ?? null,
          passport_back_path: data?.passport_back_path ?? null,
          passport_ocr_scanned_at: data?.passport_ocr_scanned_at ?? null,
          passport_ocr_data: data?.passport_ocr_data ?? null,
        });
        setValues((prev) => applyPassportOcr(prev, data?.passport_ocr_data?.fields, true));
        setShowForm(true);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateEmployee(values, isEdit);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: Record<string, any> = {
      ...prepareEmployeePayload(values),
      ...(passportMeta ?? {}),
    };
    if (isEdit) delete payload.password;

    const formData = buildEmployeeFormData(payload);
    if (isEdit) formData.append("_method", "PUT");

    const onSuccess = () => {
      localStorage.removeItem(PASSPORT_DRAFT_KEY);
      setValues({});
      setErrors({});
      setPassport(EMPTY_PASSPORT);
      setPassportMeta(null);
      setShowForm(false);
      onClose();
    };

    if (isEdit) {
      updateM.mutate(formData, { onSuccess });
    } else {
      createM.mutate(formData, { onSuccess });
    }
  };

  const isPending = isEdit ? updateM.isPending : createM.isPending;

  return {
    isEdit,
    values,
    errors,
    passport,
    showForm,
    setShowForm,
    canProceed,
    formVisible,
    ocrM,
    isPending,
    handlePassportChange,
    handleChange,
    handleProceed,
    handleSubmit,
  };
}
