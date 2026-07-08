import { useState, useRef, useEffect, useMemo } from "react";
import { Shield, ChevronDown, Check, Search, X, Loader2 } from "lucide-react";
import { SetRoleDTO } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { If } from "@shared/ui";

interface IOption {
  value: string;
  label: string;
}

const useClickOutside = (
  ref: React.RefObject<HTMLDivElement | null>,
  cb: () => void,
) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
};

const SingleSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: IOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors"
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <If is={open}>
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-44">
            {filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full px-3.5 py-2.5 text-sm text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${o.value === value ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
              >
                <span>{o.label}</span>
                <If is={o.value === value}>
                  <Check className="w-4 h-4 text-indigo-600" />
                </If>
              </button>
            ))}
          </div>
        </div>
      </If>
    </div>
  );
};

const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: IOption[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [options, search],
  );
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors"
      >
        <span className={value.length ? "text-slate-900" : "text-slate-400"}>
          {value.length ? `Выбрано: ${value.length}` : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <If is={value.length > 0}>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium"
            >
              {options.find((o) => o.value === v)?.label ?? v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="hover:text-indigo-900 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </If>
      <If is={open}>
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-44">
            {filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => toggle(o.value)}
                className={`w-full px-3.5 py-2.5 text-sm text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${value.includes(o.value) ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
              >
                <span>{o.label}</span>
                <If is={value.includes(o.value)}>
                  <Check className="w-4 h-4 text-indigo-600" />
                </If>
              </button>
            ))}
          </div>
        </div>
      </If>
    </div>
  );
};

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
          <MultiSelect
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
