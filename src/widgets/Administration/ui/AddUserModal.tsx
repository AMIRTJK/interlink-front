// Порт AddUserModal из IAMDashboard.tsx — добавление пользователя (существующий/новый).
// Реальные данные: поиск сотрудников GET_USERS, отделы GET_DEPARTMENTS,
// организации GET_ORGANIZATIONS, роли — allRoleNames.
// Существующий → SET_USER_ROLES; новый → CREATE_USER (маппируемые поля).
// Поля дизайна без контракта (дата рождения/пол/ИНН/адрес/руководитель/корп.email)
// оставлены визуально (MOCK) и не отправляются на бэкенд.
import * as React from "react";
import { X, Search, Check, CheckCircle, AlertTriangle } from "lucide-react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import {
  T,
  getRoleColor,
  labelStyle,
  inputStyle,
  cancelBtnStyle,
} from "../theme/tokens";
import type { ExtUser } from "../model";
import { adaptExtUser, unwrapList } from "../lib/adapters";

type AddUserEmployeeTab = "existing" | "new";
type SelectedEmployee =
  | { source: "existing"; user: ExtUser }
  | { source: "new"; fio: string };
interface UserFormData {
  fio: string;
  dob: string;
  gender: string;
  inn: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  position: string;
  role: string;
  joinedDate: string;
  supervisor: string;
  status: string;
  corpEmail: string;
}

function emptyFormData(defaultRole: string): UserFormData {
  return {
    fio: "",
    dob: "",
    gender: "Мужской",
    inn: "",
    phone: "",
    email: "",
    address: "",
    department: "",
    position: "",
    role: defaultRole,
    joinedDate: "",
    supervisor: "",
    status: "Активен",
    corpEmail: "",
  };
}

function buildFormDataFromExtUser(u: ExtUser, defaultRole: string): UserFormData {
  return {
    ...emptyFormData(defaultRole),
    fio: u.fio,
    email: u.email === "—" ? "" : u.email,
    department: u.department === "—" ? "" : u.department,
    position: u.position === "—" ? "" : u.position,
    role: u.roles[0] ?? defaultRole,
    joinedDate: u.joinedDate === "—" ? "" : u.joinedDate,
    status: u.status === "Заблокирован" ? "Неактивен" : u.status,
    corpEmail: u.email === "—" ? "" : u.email,
  };
}

export function AddUserModal({
  onClose,
  allRoleNames,
  existingUsers,
  addToast,
}: {
  onClose: () => void;
  allRoleNames: string[];
  existingUsers: ExtUser[];
  addToast: (msg: string) => void;
}) {
  const defaultRole = allRoleNames[0] ?? "";
  const [employeeTab, setEmployeeTab] =
    React.useState<AddUserEmployeeTab>("existing");
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<SelectedEmployee | null>(null);
  const [formData, setFormData] = React.useState<UserFormData>(
    emptyFormData(defaultRole),
  );
  const [isAutofilled, setIsAutofilled] = React.useState(false);
  const [showFields, setShowFields] = React.useState(false);
  const [existingSearch, setExistingSearch] = React.useState("");
  const [existingDropdownOpen, setExistingDropdownOpen] = React.useState(false);
  const existingDropRef = React.useRef<HTMLDivElement>(null);
  const [newFio, setNewFio] = React.useState("");
  const [newSearchResult, setNewSearchResult] = React.useState<
    "idle" | "found" | "notfound"
  >("idle");
  const [newSearching, setNewSearching] = React.useState(false);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        existingDropRef.current &&
        !existingDropRef.current.contains(e.target as Node)
      )
        setExistingDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Отделы/организации для селектов и маппинга в CREATE_USER
  const { data: deptsData } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    useToken: true,
    options: { refetchOnWindowFocus: false, staleTime: 30 * 60 * 1000 },
  });
  const { data: orgsData } = useGetQuery({
    url: ApiRoutes.GET_ORGANIZATIONS,
    useToken: true,
    options: { refetchOnWindowFocus: false, staleTime: 30 * 60 * 1000 },
  });
  const departments = React.useMemo(
    () => unwrapList<{ id: number; name: string }>(deptsData),
    [deptsData],
  );
  const organizations = React.useMemo(
    () => unwrapList<{ id: number; name: string }>(orgsData),
    [orgsData],
  );

  // Поиск существующих сотрудников
  const { data: searchData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: { search: existingSearch, per_page: "8" },
    options: {
      enabled: employeeTab === "existing" && existingDropdownOpen,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  });
  const searchResults = React.useMemo(() => {
    const raw = unwrapList<IAdminUser>(searchData).map(adaptExtUser);
    if (raw.length) return raw.slice(0, 8);
    // fallback на уже загруженный список, если запрос ещё не пришёл
    if (!existingSearch.trim()) return existingUsers.slice(0, 8);
    const q = existingSearch.toLowerCase();
    return existingUsers
      .filter(
        (u) =>
          u.fio.toLowerCase().includes(q) ||
          u.position.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [searchData, existingSearch, existingUsers]);

  const createUserM = useMutationQuery({
    url: () => ApiRoutes.CREATE_USER,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS],
    },
  });
  const setUserRolesM = useMutationQuery({
    url: () => ApiRoutes.SET_USER_ROLES,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS],
    },
  });

  const selectExistingEmployee = (u: ExtUser) => {
    setSelectedEmployee({ source: "existing", user: u });
    setExistingSearch(u.fio);
    setExistingDropdownOpen(false);
    setFormData(buildFormDataFromExtUser(u, defaultRole));
    setIsAutofilled(true);
    setShowFields(true);
  };

  const handleNewSearch = () => {
    if (!newFio.trim()) return;
    setNewSearching(true);
    _axios
      .get(ApiRoutes.GET_USERS, { params: { search: newFio, per_page: 5 } })
      .then((res) => {
        const found = unwrapList<IAdminUser>(res.data).map(adaptExtUser)[0];
        setNewSearching(false);
        if (found) {
          setNewSearchResult("found");
          selectExistingEmployee(found);
        } else {
          setNewSearchResult("notfound");
          setSelectedEmployee({ source: "new", fio: newFio.trim() });
          setFormData({ ...emptyFormData(defaultRole), fio: newFio.trim() });
          setIsAutofilled(false);
          setShowFields(true);
        }
      })
      .catch(() => {
        setNewSearching(false);
        setNewSearchResult("notfound");
        setSelectedEmployee({ source: "new", fio: newFio.trim() });
        setFormData({ ...emptyFormData(defaultRole), fio: newFio.trim() });
        setIsAutofilled(false);
        setShowFields(true);
      });
  };

  const setField = (key: keyof UserFormData, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const canSubmit = selectedEmployee !== null && formData.fio.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit || !selectedEmployee) return;
    if (selectedEmployee.source === "existing") {
      setUserRolesM.mutate(
        {
          user_id: Number(selectedEmployee.user.id),
          roles: [formData.role],
        },
        {
          onSuccess: () => {
            addToast(`Роль назначена · ${formData.fio}`);
            onClose();
          },
        },
      );
    } else {
      const parts = formData.fio.trim().split(/\s+/);
      const last_name = parts[0] ?? "";
      const first_name = parts.slice(1).join(" ") || last_name;
      const dept = departments.find((d) => d.name === formData.department);
      createUserM.mutate(
        {
          last_name,
          first_name,
          phone: formData.phone,
          position: formData.position,
          organization_id: organizations[0]?.id,
          department_id: dept?.id,
          roles: [formData.role],
        },
        {
          onSuccess: () => {
            addToast(`Пользователь добавлен · ${formData.fio}`);
            onClose();
          },
        },
      );
    }
  };

  const switchTab = (tab: AddUserEmployeeTab) => {
    setEmployeeTab(tab);
    setSelectedEmployee(null);
    setFormData(emptyFormData(defaultRole));
    setIsAutofilled(false);
    setShowFields(false);
    setExistingSearch("");
    setExistingDropdownOpen(false);
    setNewFio("");
    setNewSearchResult("idle");
  };

  const autofillBadge = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        background: "#ECFDF5",
        color: T.success,
        borderRadius: 4,
        padding: "1px 6px",
        fontSize: 9,
        fontWeight: 700,
        border: "1px solid #A7F3D0",
        marginLeft: 6,
      }}
    >
      Авт.
    </span>
  );
  const fieldLabel = (text: string, autofilled?: boolean) => (
    <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
      <span>{text}</span>
      {autofilled && isAutofilled && autofillBadge}
    </label>
  );
  const inputAutofillStyle = (autofilled: boolean): React.CSSProperties => ({
    ...inputStyle,
    background: autofilled && isAutofilled ? "#F0FDF4" : T.surface,
    borderColor: autofilled && isAutofilled ? "#86EFAC" : T.border,
  });
  const supervisorOptions = existingUsers.map((u) => u.fio);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "backdropIn 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderRadius: 10,
          boxShadow: T.shadowXl,
          animation: "modalFadeIn 0.2s ease-out forwards",
          width: 700,
          height: showFields ? "auto" : 480,
          minHeight: showFields ? 550 : "auto",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: T.font,
          margin: "0 16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 24px",
            height: 64,
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: T.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            Добавление пользователя
          </h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.textSecondary,
              cursor: "pointer",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                T.hoverBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: showFields ? "auto" : "hidden",
            padding: "22px 24px",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                ...labelStyle,
                fontSize: 13,
                fontWeight: 700,
                color: T.textPrimary,
                marginBottom: 12,
              }}
            >
              Выбор сотрудника
            </label>
            <div
              style={{
                display: "flex",
                gap: 0,
                borderBottom: `2px solid ${T.border}`,
                marginBottom: 16,
              }}
            >
              {(
                [
                  ["existing", "Существующие сотрудники"],
                  ["new", "Новые сотрудники"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    padding: "7px 16px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: employeeTab === tab ? 600 : 400,
                    color: employeeTab === tab ? T.accent : T.textSecondary,
                    fontFamily: T.font,
                    borderBottom:
                      employeeTab === tab
                        ? `2px solid ${T.accent}`
                        : "2px solid transparent",
                    marginBottom: -2,
                    transition: "color 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {employeeTab === "existing" && (
              <div ref={existingDropRef} style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: `1.5px solid ${
                      existingDropdownOpen ? T.accent : T.border
                    }`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    background: T.surface,
                    transition: "border-color 0.15s",
                    cursor: "text",
                  }}
                  onClick={() => setExistingDropdownOpen(true)}
                >
                  <Search
                    size={14}
                    color={T.textSecondary}
                    style={{ flexShrink: 0 }}
                  />
                  <input
                    type="text"
                    placeholder="Введите ФИО для поиска сотрудника..."
                    value={existingSearch}
                    onChange={(e) => {
                      setExistingSearch(e.target.value);
                      setExistingDropdownOpen(true);
                    }}
                    onFocus={() => setExistingDropdownOpen(true)}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 13,
                      color: T.textPrimary,
                      fontFamily: T.font,
                      width: "100%",
                    }}
                  />
                  {existingSearch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExistingSearch("");
                        setSelectedEmployee(null);
                        setShowFields(false);
                        setFormData(emptyFormData(defaultRole));
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.textSecondary,
                        display: "flex",
                        padding: 2,
                        flexShrink: 0,
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                {existingDropdownOpen && (
                  <div
                    style={{
                      marginTop: 8,
                      background: T.surface,
                      borderRadius: 10,
                      border: `1px solid ${T.border}`,
                      boxShadow: T.shadow,
                      maxHeight: 180,
                      overflowY: "auto",
                    }}
                  >
                    {searchResults.length === 0 ? (
                      <div
                        style={{
                          padding: "14px 16px",
                          fontSize: 13,
                          color: T.textSecondary,
                          textAlign: "center",
                        }}
                      >
                        Сотрудник не найден
                      </div>
                    ) : (
                      searchResults.map((u) => {
                        const cfg = getRoleColor(u.roles[0]);
                        const isSelected =
                          selectedEmployee?.source === "existing" &&
                          selectedEmployee.user.id === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => selectExistingEmployee(u)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              width: "100%",
                              padding: "11px 14px",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              background: isSelected ? "#EFF6FF" : "transparent",
                              fontFamily: T.font,
                              borderBottom: `1px solid ${T.border}`,
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected)
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = T.hoverBg;
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.background = isSelected
                                ? "#EFF6FF"
                                : "transparent";
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: cfg.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 700,
                                color: cfg.text,
                                flexShrink: 0,
                                border: `1.5px solid ${cfg.text}20`,
                              }}
                            >
                              {u.avatarInitials}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: T.textPrimary,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {u.fio}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: T.textSecondary,
                                  marginTop: 1,
                                }}
                              >
                                <span>{u.position}</span>
                                <span
                                  style={{ margin: "0 5px", color: T.border }}
                                >
                                  ·
                                </span>
                                <span>{u.department}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check
                                size={14}
                                color={T.accent}
                                style={{ flexShrink: 0 }}
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {employeeTab === "new" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Введите ФИО нового сотрудника"
                    value={newFio}
                    onChange={(e) => {
                      setNewFio(e.target.value);
                      setNewSearchResult("idle");
                    }}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={handleNewSearch}
                    disabled={newSearching || !newFio.trim()}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: !newFio.trim() ? T.border : T.accent,
                      color: !newFio.trim() ? T.textSecondary : "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: newFio.trim() ? "pointer" : "not-allowed",
                      fontFamily: T.font,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                  >
                    {newSearching ? "Поиск..." : "Найти в системе"}
                  </button>
                </div>
                {newSearchResult === "notfound" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 13px",
                      borderRadius: 8,
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                      fontSize: 13,
                      color: "#92400E",
                    }}
                  >
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>Сотрудник не найден — заполните данные вручную</span>
                  </div>
                )}
                {newSearchResult === "found" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 13px",
                      borderRadius: 8,
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      fontSize: 13,
                      color: "#065F46",
                    }}
                  >
                    <CheckCircle size={13} style={{ flexShrink: 0 }} />
                    <span>
                      Сотрудник найден — данные заполнены автоматически
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {showFields && (
            <div style={{ animation: "fieldsSlideDown 220ms ease-out forwards" }}>
              <div
                style={{ height: 1, background: T.border, margin: "0 0 20px" }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 14,
                    }}
                  >
                    Персональная информация
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      {fieldLabel("ФИО", true)}
                      <input
                        value={formData.fio}
                        onChange={(e) => setField("fio", e.target.value)}
                        placeholder="Иванов Иван Иванович"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                    <div>
                      {fieldLabel("Дата рождения", true)}
                      <input
                        type="text"
                        value={formData.dob}
                        onChange={(e) => setField("dob", e.target.value)}
                        placeholder="дд.мм.гггг"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                    <div>
                      {fieldLabel("Пол", true)}
                      <select
                        value={formData.gender}
                        onChange={(e) => setField("gender", e.target.value)}
                        style={{
                          ...inputAutofillStyle(true),
                          cursor: "pointer",
                        }}
                      >
                        <option value="Мужской">Мужской</option>
                        <option value="Женский">Женский</option>
                      </select>
                    </div>
                    <div>
                      {fieldLabel("ИНН", true)}
                      <input
                        value={formData.inn}
                        onChange={(e) => setField("inn", e.target.value)}
                        placeholder="000000000000"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                    <div>
                      {fieldLabel("Контактный телефон", true)}
                      <input
                        value={formData.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        placeholder="+7 (___) ___-__-__"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                    <div>
                      {fieldLabel("Email", true)}
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="ivanov@company.ru"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                    <div>
                      {fieldLabel("Адрес", true)}
                      <input
                        value={formData.address}
                        onChange={(e) => setField("address", e.target.value)}
                        placeholder="г. Москва, ул. ..."
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.textSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 14,
                    }}
                  >
                    Рабочая информация
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      {fieldLabel("Отдел", true)}
                      <select
                        value={formData.department}
                        onChange={(e) => setField("department", e.target.value)}
                        style={{
                          ...inputAutofillStyle(true),
                          cursor: "pointer",
                        }}
                      >
                        <option value="">— Выберите отдел —</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      {fieldLabel("Должность", true)}
                      <input
                        value={formData.position}
                        onChange={(e) => setField("position", e.target.value)}
                        placeholder="Специалист"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                    <div>
                      {fieldLabel("Роль", true)}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <select
                          value={formData.role}
                          onChange={(e) => setField("role", e.target.value)}
                          style={{
                            ...inputAutofillStyle(true),
                            cursor: "pointer",
                            flex: 1,
                          }}
                        >
                          {allRoleNames.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {isAutofilled && formData.role && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: getRoleColor(formData.role).bg,
                              color: getRoleColor(formData.role).text,
                              border: `1px solid ${getRoleColor(formData.role).text}22`,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {formData.role}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {fieldLabel("Дата приёма на работу", true)}
                      <input
                        type="text"
                        value={formData.joinedDate}
                        onChange={(e) =>
                          setField("joinedDate", e.target.value)
                        }
                        placeholder="дд.мм.гггг"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                    <div>
                      {fieldLabel("Непосредственный руководитель", true)}
                      <select
                        value={formData.supervisor}
                        onChange={(e) =>
                          setField("supervisor", e.target.value)
                        }
                        style={{
                          ...inputAutofillStyle(true),
                          cursor: "pointer",
                        }}
                      >
                        <option value="">— Выберите руководителя —</option>
                        {supervisorOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      {fieldLabel("Статус")}
                      <select
                        value={formData.status}
                        onChange={(e) => setField("status", e.target.value)}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        <option value="Активен">Активен</option>
                        <option value="Неактивен">Неактивен</option>
                        <option value="В отпуске">В отпуске</option>
                        <option value="В командировке">В командировке</option>
                      </select>
                    </div>
                    <div>
                      {fieldLabel("Корпоративный email", true)}
                      <input
                        type="email"
                        value={formData.corpEmail}
                        onChange={(e) => setField("corpEmail", e.target.value)}
                        placeholder="ivanov@company.ru"
                        style={inputAutofillStyle(true)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 24px",
            height: 60,
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: T.surface,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: T.textSecondary,
              fontWeight: 500,
              minWidth: 0,
            }}
          >
            {selectedEmployee ? (
              <span
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#EFF6FF",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: T.accent,
                    flexShrink: 0,
                  }}
                >
                  {formData.fio
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span style={{ fontWeight: 600, color: T.textPrimary }}>
                  {formData.fio || "—"}
                </span>
              </span>
            ) : (
              <span style={{ color: "#94A3B8" }}>Сотрудник не выбран</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={onClose} style={cancelBtnStyle}>
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !canSubmit || createUserM.isPending || setUserRolesM.isPending
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 20px",
                height: 36,
                borderRadius: 8,
                border: "none",
                background: canSubmit ? T.accent : T.border,
                color: canSubmit ? "#fff" : T.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontFamily: T.font,
                boxShadow: canSubmit ? `0 2px 8px ${T.accent}35` : "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
            >
              <Check size={14} />
              <span>Добавить пользователя</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
