// Порт DeleteRoleModal из IAMDashboard.tsx — подтверждение удаления роли.
// Удаление через DELETE_ROLE.
import { X, AlertTriangle } from "lucide-react";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { T, cancelBtnStyle } from "../theme/tokens";
import { ModalBackdrop } from "./components";

export function DeleteRoleModal({
  roleId,
  roleName,
  userCount,
  onClose,
  onDeleted,
  addToast,
}: {
  roleId: string;
  roleName: string;
  userCount: number;
  onClose: () => void;
  onDeleted: () => void;
  addToast: (msg: string) => void;
}) {
  const deleteRoleM = useMutationQuery({
    url: () => ApiRoutes.DELETE_ROLE.replace(":id", roleId),
    method: "DELETE",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_ROLES],
    },
  });

  const handleConfirm = () => {
    deleteRoleM.mutate(
      {},
      {
        onSuccess: () => {
          addToast(`Роль «${roleName}» удалена`);
          onDeleted();
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
            marginBottom: 20,
          }}
        >
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
            Удаление роли
          </h2>
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
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            padding: "14px 16px",
            background: "#FEF2F2",
            borderRadius: 8,
            border: "1px solid #FECACA",
            marginBottom: 6,
          }}
        >
          <AlertTriangle
            size={17}
            color={T.danger}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#7F1D1D",
              lineHeight: 1.6,
              fontFamily: T.font,
            }}
          >
            <span>
              Вы собираетесь удалить роль <strong>«{roleName}»</strong>. Эта
              роль назначена{" "}
            </span>
            <strong>{userCount} пользователям</strong>
            <span>. Убедитесь, что удаление роли не нарушит доступы.</span>
          </p>
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
          onClick={handleConfirm}
          disabled={deleteRoleM.isPending}
          style={{
            flex: 1,
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: T.danger,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
            opacity: deleteRoleM.isPending ? 0.7 : 1,
          }}
        >
          Удалить
        </button>
        <button onClick={onClose} style={cancelBtnStyle}>
          Отмена
        </button>
      </div>
    </ModalBackdrop>
  );
}
