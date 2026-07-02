import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  ArrowRight,
  Settings,
  UserCog,
  KeyRound,
} from "lucide-react";
import { AppRoutes } from "@shared/config";
import { T, ensureStyles } from "@widgets/Administration";

// Главная страница модуля «Администрирование»: приветствие + карточки подмодулей
const SUBMODULES: {
  key: string;
  route: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
}[] = [
  {
    key: "users",
    route: AppRoutes.ADMINISTRATION_USERS,
    title: "Пользователи",
    description:
      "Управление учётными записями сотрудников: просмотр, добавление, роли, статусы и доступы.",
    icon: <Users size={22} />,
    accent: "#3B82F6",
    accentBg: "#EFF6FF",
  },
  {
    key: "roles",
    route: AppRoutes.ADMINISTRATION_ROLES,
    title: "Роли и доступы",
    description:
      "Настройка ролей, прав доступа и разрешений для модулей системы электронного документооборота.",
    icon: <ShieldCheck size={22} />,
    accent: "#8B5CF6",
    accentBg: "#F5F3FF",
  },
];

const FEATURES: { icon: React.ReactNode; label: string }[] = [
  { icon: <UserCog size={15} />, label: "Управление сотрудниками" },
  { icon: <KeyRound size={15} />, label: "Права и разрешения" },
  { icon: <Settings size={15} />, label: "Настройка ролей" },
];

export const AdministrationHomePage: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    ensureStyles();
  }, []);

  return (
    <div
      style={{
        fontFamily: T.font,
        background: T.bg,
        minHeight: "calc(100vh - 140px)",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Hero */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.sidebar} 0%, #1E293B 100%)`,
            borderRadius: 16,
            padding: "32px 36px",
            color: "#fff",
            boxShadow: T.shadowMd,
            marginBottom: 28,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={24} color="#fff" />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                Администрирование
              </h1>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Центр управления пользователями и доступами системы
              </p>
            </div>
          </div>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: 14,
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 720,
            }}
          >
            Раздел «Администрирование» объединяет управление учётными записями
            сотрудников и настройку ролей и прав доступа. Здесь вы можете
            добавлять пользователей, назначать им роли, контролировать статусы и
            гибко настраивать разрешения для модулей системы.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {FEATURES.map((f) => (
              <div
                key={f.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.1)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {f.icon}
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submodule cards */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: T.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
            paddingLeft: 2,
          }}
        >
          Подмодули
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {SUBMODULES.map((m) => (
            <div
              key={m.key}
              onClick={() => navigate(m.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate(m.route);
              }}
              style={{
                background: T.surface,
                borderRadius: 14,
                border: `1px solid ${T.border}`,
                padding: "24px 24px 20px",
                cursor: "pointer",
                boxShadow: T.shadow,
                transition: "box-shadow 0.18s, transform 0.18s, border-color 0.18s",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  T.shadowMd;
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  m.accent + "55";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadow;
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  T.border;
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: m.accentBg,
                  color: m.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {m.icon}
              </div>
              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: 17,
                  fontWeight: 700,
                  color: T.textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                {m.title}
              </h3>
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: T.textSecondary,
                  flex: 1,
                }}
              >
                {m.description}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: m.accent,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span>Перейти</span>
                <ArrowRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
