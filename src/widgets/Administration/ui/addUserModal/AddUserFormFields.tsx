import * as React from "react";
import { T, getRoleColor, labelStyle, inputStyle } from "../../theme/tokens";
import type { UserFormData } from "./addUserModalModel";

interface IProps {
  formData: UserFormData;
  setField: (key: keyof UserFormData, val: string) => void;
  isAutofilled: boolean;
  departments: { id: number; name: string }[];
  allRoleNames: string[];
  supervisorOptions: string[];
}

export function AddUserFormFields({
  formData,
  setField,
  isAutofilled,
  departments,
  allRoleNames,
  supervisorOptions,
}: IProps) {
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

  return (
    <div style={{ animation: "fieldsSlideDown 220ms ease-out forwards" }}>
      <div style={{ height: 1, background: T.border, margin: "0 0 20px" }} />
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
                onChange={(e) => setField("joinedDate", e.target.value)}
                placeholder="дд.мм.гггг"
                style={inputAutofillStyle(true)}
              />
            </div>
            <div>
              {fieldLabel("Непосредственный руководитель", true)}
              <select
                value={formData.supervisor}
                onChange={(e) => setField("supervisor", e.target.value)}
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
  );
}
