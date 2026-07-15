import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { IAdminUser, IPassportOcrData, IPassportOcrResponse } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { If } from "@shared/ui";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { PassportUploadStep, IPassportFile, IPassportSides } from "./PassportUploadStep";
import { applyPassportOcr, buildEmployeeFormData, mapEmployeeToForm, prepareEmployeePayload, resolveEmployeePhotoUrl, validateEmployee } from "../lib";
import "./employeeForm.css";

interface IProps {
  open: boolean;
  onClose: () => void;
  employee?: IAdminUser | null;
}

// Результат загрузки паспорта (POST /api/v1/admin/users/passport-ocr), который
// отправляется вместе с остальными полями в POST /api/v1/admin/users.
interface IPassportMeta {
  passport_front_path: string | null;
  passport_back_path: string | null;
  passport_ocr_scanned_at: string | null;
  passport_ocr_data: IPassportOcrData | null;
}

// Черновик фото паспорта сохраняется в localStorage, чтобы случайное закрытие
// модалки не приводило к потере уже загруженного файла — при повторном открытии
// создания сотрудника паспорт (и, соответственно, поля формы) восстанавливаются.
const PASSPORT_DRAFT_KEY = "hr_passport_draft";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataUrlToFile = (dataUrl: string, name: string, type: string): File => {
  const [meta, base64] = dataUrl.split(",");
  const mime = type || meta.match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(base64);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], name, { type: mime });
};

const EMPTY_PASSPORT: IPassportSides = { front: null, back: null };

const sideToStored = (side: IPassportFile | null) =>
  side ? fileToDataUrl(side.file).then((dataUrl) => ({ name: side.file.name, type: side.file.type, dataUrl })) : Promise.resolve(null);

const storedToSide = (stored: { name: string; type: string; dataUrl: string } | null): IPassportFile | null => {
  if (!stored?.dataUrl) return null;
  return { file: dataUrlToFile(stored.dataUrl, stored.name, stored.type), previewUrl: stored.dataUrl };
};

const readPassportDraft = (): IPassportSides => {
  try {
    const raw = localStorage.getItem(PASSPORT_DRAFT_KEY);
    if (!raw) return EMPTY_PASSPORT;
    const parsed = JSON.parse(raw);
    return {
      front: storedToSide(parsed.front),
      back: storedToSide(parsed.back),
    };
  } catch {
    return EMPTY_PASSPORT;
  }
};

export const EmployeeFormModal = ({ open, onClose, employee }: IProps) => {
  const isEdit = !!employee?.id;
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passport, setPassport] = useState<IPassportSides>(EMPTY_PASSPORT);
  // Паспортные пути и OCR-данные из ответа passport-ocr. Хранятся отдельно от values
  // (пользователь их не редактирует напрямую) и отправляются вместе с формой при создании.
  const [passportMeta, setPassportMeta] = useState<IPassportMeta | null>(null);
  // «Как сфотографировать паспорт» и «Новый сотрудник» — два отдельных шага/окна.
  // Пока showForm === false показываем только шаг с паспортом; после нажатия
  // «Продолжить» показываем только форму сотрудника (без блока с паспортом).
  const [showForm, setShowForm] = useState(false);

  // Лицевая сторона обязательна для эндпоинта passport-ocr (поле passport_front).
  const canProceed = !!passport.front;
  const formVisible = isEdit || showForm;

  // Создание/редактирование сотрудника теперь идёт как multipart/form-data (в запросе
  // передаётся файл фото). Редактирование шлётся POST-ом с _method=PUT (spoofing) —
  // PHP не разбирает файлы в теле настоящих PUT/PATCH-запросов.
  const createM = useMutationQuery<FormData>({
    url: ApiRoutes.CREATE_USER,
    method: "POST",
    messages: { success: "Сотрудник создан", invalidate: [ApiRoutes.GET_USERS] },
  });

  const updateM = useMutationQuery<FormData>({
    url: () => ApiRoutes.UPDATE_USER.replace(":id", String(employee?.id)),
    method: "POST",
    messages: { success: "Сотрудник обновлён", invalidate: [ApiRoutes.GET_USERS] },
  });

  // Загрузка фото паспорта + OCR (multipart/form-data). В ответе — пути к файлам и
  // структура passport_ocr_data. Пока OCR на сервере отключён, fields приходят null.
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
      // Восстанавливаем ранее загруженный паспорт (если модалку случайно закрыли).
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
      const [front, back] = await Promise.all([sideToStored(val.front), sideToStored(val.back)]);
      localStorage.setItem(PASSPORT_DRAFT_KEY, JSON.stringify({ front, back }));
    } catch {
      // Файлы слишком большие для localStorage — просто не сохраняем черновик.
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

  // Шаг «Продолжить»: загружаем фото паспорта на сервер (passport-ocr), сохраняем
  // пути и OCR-данные, автоматически заполняем поля формы распознанными значениями
  // (если OCR активен) и переходим к форме сотрудника.
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
        // OCR отключён на сервере → fields === null → значения не меняются, ручной ввод.
        // OCR активен → распознанные поля подставляются автоматически (не затирая ввод).
        setValues((prev) => applyPassportOcr(prev, data?.passport_ocr_data?.fields));
        setShowForm(true);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateEmployee(values, isEdit);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Паспортные пути/OCR-данные и файл фото (values.photo) отправляются вместе с
    // остальными полями формы одним multipart-запросом.
    const payload: Record<string, any> = {
      ...prepareEmployeePayload(values),
      ...(passportMeta ?? {}),
    };
    if (isEdit) delete payload.password;

    const formData = buildEmployeeFormData(payload);
    // Method spoofing: настоящий PUT с multipart не даёт PHP разобрать файл.
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

  if (!open) return null;

  const isPending = isEdit ? updateM.isPending : createM.isPending;
  const badge = isEdit ? [employee?.last_name?.[0], employee?.first_name?.[0]].filter(Boolean).join("").toUpperCase() || "✎" : "??";
  const showTitle = formVisible;
  const organizationId = values.organization_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-[94vw] max-w-[860px] max-h-[88vh] flex flex-col overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-slate-800">
        <If is={showTitle}>
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-3">
              <If is={isEdit}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden bg-indigo-500!">
                  {badge}
                </div>
              </If>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                  {isEdit ? "Редактирование сотрудника" : "Новый сотрудник"}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </If>
        <If is={!showTitle}>
          <div className="flex items-center justify-between px-6 pt-6 pb-2 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
              Как сфотографировать паспорт
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </If>

        <form
          onSubmit={handleSubmit}
          className={`hr-create-form px-6 pb-6 space-y-5 overflow-y-auto flex-1 scrollbar-stable ${showTitle ? "pt-6" : "pt-0"}`}
        >
          {/* Шаг 1 — отдельное окно «Как сфотографировать паспорт» */}
          <If is={!isEdit && !showForm}>
            <PassportUploadStep value={passport} onChange={handlePassportChange} />
            <If is={!passport.front}>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center">
                Загрузите лицевую сторону паспорта, чтобы продолжить.
              </p>
            </If>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleProceed}
                disabled={!canProceed || ocrM.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <If is={ocrM.isPending}>
                  <Loader2 size={16} className="animate-spin" />
                </If>
                {ocrM.isPending ? "Загрузка…" : "Продолжить"}
              </button>
            </div>
          </If>

          {/* Шаг 2 — отдельное окно «Новый сотрудник» (форма без блока паспорта) */}
          <If is={formVisible}>
            <If is={!isEdit && canProceed}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 mr-1">Паспорт:</span>
                <If is={!!passport.front}>
                  <img src={passport.front?.previewUrl} alt="Лицевая" className="h-12 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-slate-700" />
                </If>
                <If is={!!passport.back}>
                  <img src={passport.back?.previewUrl} alt="Обратная" className="h-12 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-slate-700" />
                </If>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="ml-auto text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Изменить
                </button>
              </div>
            </If>

            <EmployeeFormFields
              values={values}
              errors={errors}
              handleChange={handleChange}
              organizationId={organizationId}
              isEdit={isEdit}
              initialPhoto={resolveEmployeePhotoUrl(employee) || undefined}
            />

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isEdit ? "Сохранить" : "Добавить сотрудника"}
              </button>
            </div>
          </If>
        </form>
      </div>
    </div>
  );
};
