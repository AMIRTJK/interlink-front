import { useState, useMemo } from "react";
import { Shield, Loader2 } from "lucide-react";
import { SetRoleDTO } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { If } from "@shared/ui";
import { SingleSelect } from "./setRoles/SingleSelect";
import { SetRolesMultiSelect } from "./setRoles/SetRolesMultiSelect";
import type { IOption } from "./setRoles/setRolesModel";

export const SetUserRole = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [errors, setErrors] = useState({ user: false, roles: false });

  const { mutate, isPending, isAllowed } = useMutationQuery<SetRoleDTO>({
    url: ApiRoutes.SET_USER_ROLES,
    method: "POST",
    messages: { success: "Роли обновлены" },
    preload: true,
    preloadConditional: ["roles.update"],
  });

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
  });
  const { data: rolesData } = useGetQuery({
    url: ApiRoutes.GET_ROLES,
    useToken: true,
  });

  const userOptions: IOption[] = useMemo(() => {
    const arr =
      (usersData as any)?.data?.data ?? (usersData as any)?.data ?? [];
    return Array.isArray(arr)
      ? arr.map((u: any) => ({
          value: String(u.id),
          label: u.full_name ?? `${u.last_name} ${u.first_name}`,
        }))
      : [];
  }, [usersData]);

  const roleOptions: IOption[] = useMemo(() => {
    const raw = (rolesData as any)?.data;
    const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return Array.isArray(arr)
      ? arr.map((r: any) => ({ value: r.name, label: r.name }))
      : [];
  }, [rolesData]);

  const handleSubmit = () => {
    const newErrors = {
      user: !selectedUserId,
      roles: selectedRoles.length === 0,
    };
    setErrors(newErrors);
    if (newErrors.user || newErrors.roles) return;
    mutate({ user_id: Number(selectedUserId), roles: selectedRoles });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Назначить роли
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Управление ролями пользователей
          </p>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Пользователь
          </label>
          <SingleSelect
            options={userOptions}
            value={selectedUserId}
            onChange={(v) => {
              setSelectedUserId(v);
              setErrors((p) => ({ ...p, user: false }));
            }}
            placeholder="Выберите пользователя"
          />
          <If is={errors.user}>
            <p className="text-xs text-red-500 mt-1">Выберите пользователя</p>
          </If>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Роли</label>
          <SetRolesMultiSelect
            options={roleOptions}
            value={selectedRoles}
            onChange={(v) => {
              setSelectedRoles(v);
              setErrors((p) => ({ ...p, roles: false }));
            }}
            placeholder="Выберите роли"
          />
          <If is={errors.roles}>
            <p className="text-xs text-red-500 mt-1">
              Выберите хотя бы одну роль
            </p>
          </If>
        </div>
        <button
          type="button"
          disabled={!isAllowed || isPending}
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md shadow-indigo-900/30 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          <If is={isPending}>
            <Loader2 className="w-4 h-4 animate-spin" />
          </If>
          Обновить доступ
        </button>
      </div>
    </div>
  );
};
