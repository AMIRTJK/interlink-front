import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "@shared/lib/toast";
import { SettingsModalShell } from "./settings/SettingsModalShell";
import {
  PasswordField,
  PlainButton,
  PrimaryButton,
  useSettingsTheme,
} from "./settings/settingsUi";

interface IForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type IErrors = Partial<Record<keyof IForm, string>>;

const EMPTY: IForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const ChangePassword = () => {
  const { gradient } = useSettingsTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<IForm>(EMPTY);
  const [errors, setErrors] = useState<IErrors>({});

  const handleOpen = () => {
    setForm(EMPTY);
    setErrors({});
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const setField = (key: keyof IForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: IErrors = {};
    if (!form.currentPassword) next.currentPassword = "Введите текущий пароль";
    if (!form.newPassword) next.newPassword = "Введите новый пароль";
    else if (form.newPassword.length < 6)
      next.newPassword = "Пароль должен быть не менее 6 символов";
    if (!form.confirmPassword) next.confirmPassword = "Подтвердите новый пароль";
    else if (form.confirmPassword !== form.newPassword)
      next.confirmPassword = "Пароли не совпадают";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    toast.success("Пароль успешно изменен");
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Пароль безопасности
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Смена пароля от аккаунта
          </p>
        </div>
      </div>

      <PlainButton onClick={handleOpen}>Изменить</PlainButton>

      <SettingsModalShell
        isOpen={isOpen}
        onClose={handleClose}
        width={380}
        icon={<KeyRound className="h-5 w-5" />}
        title="Смена пароля"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Текущий пароль"
            required
            placeholder="Введите текущий пароль"
            value={form.currentPassword}
            onChange={setField("currentPassword")}
            error={errors.currentPassword}
          />
          <PasswordField
            label="Новый пароль"
            required
            placeholder="Введите новый пароль"
            value={form.newPassword}
            onChange={setField("newPassword")}
            error={errors.newPassword}
          />
          <PasswordField
            label="Подтверждение нового пароля"
            required
            placeholder="Повторите новый пароль"
            value={form.confirmPassword}
            onChange={setField("confirmPassword")}
            error={errors.confirmPassword}
          />

          <PrimaryButton gradient={gradient} type="submit" className="w-full">
            Сохранить
          </PrimaryButton>
        </form>
      </SettingsModalShell>
    </div>
  );
};
