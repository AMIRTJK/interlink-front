// Создание UI-права — POST /api/v1/admin/permissions с именем вида "ui.*".
// Системные permissions с фронта придумывать нельзя (см. ТЗ), поэтому здесь
// разрешён только префикс "ui." — остальное отклоняется на уровне формы.
import * as React from "react";
import { X, ShieldPlus } from "lucide-react";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { T, labelStyle, inputStyle, cancelBtnStyle, primaryBtnStyle } from "../theme/tokens";
import { ModalBackdrop } from "./components";

const UI_PERMISSION_RE = /^ui\.[a-z0-9_-]+(\.[a-z0-9_-]+)*$/;

export function CreateUiPermissionModal({
  onClose,
  onCreated,
  addToast,
}: {
  onClose: () => void;
  onCreated: () => void;
  addToast: (msg: string) => void;
}) {
  const [name, setName] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const isValid = UI_PERMISSION_RE.test(name.trim());

  const createPermissionM = useMutationQuery({
    url: () => ApiRoutes.CREATE_PERMISSION,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.FETCH_PERMISSIONS],
    },
  });

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    createPermissionM.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          addToast(`UI-право «${name.trim()}» создано`);
          onCreated();
          onClose();
        },
      },
    );
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <div style={{ padding: "24px 24px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldPlus size={16} color={T.accent} />
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: T.textPrimary,
                letterSpacing: "-0.02em",
                fontFamily: T.font,
              }}
            >
              Создание UI-права
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.textSecondary,
              padding: 4,
              display: "flex",
              borderRadius: 6,
            }}
          >
            <X size={16} />
          </button>
        </div>
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            color: T.textSecondary,
            fontFamily: T.font,
          }}
        >
          Кастомное право для интерфейса, не влияет на серверные проверки.
        </p>
        <div>
          <label style={labelStyle}>Название права</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="ui.analytics.view"
            style={{
              ...inputStyle,
              borderColor: touched && !isValid ? T.danger : undefined,
            }}
          />
          {touched && !isValid && (
            <div style={{ marginTop: 6, fontSize: 12, color: T.danger }}>
              Должно начинаться с "ui." и содержать только латиницу, цифры, . _ -
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          gap: 8,
          borderTop: `1px solid ${T.border}`,
          marginTop: 20,
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={createPermissionM.isPending || (touched && !isValid)}
          style={{
            ...primaryBtnStyle,
            flex: 1,
            justifyContent: "center",
            opacity: createPermissionM.isPending ? 0.7 : 1,
          }}
        >
          Создать
        </button>
        <button onClick={onClose} style={cancelBtnStyle}>
          Отмена
        </button>
      </div>
    </ModalBackdrop>
  );
}
