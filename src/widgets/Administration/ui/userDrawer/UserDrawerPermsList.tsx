import * as React from "react";
import { T } from "../../theme/tokens";
import { ToggleSwitch } from "../components";
import type { PermModule } from "../../model";

interface IProps {
  isLoading: boolean;
  perms: PermModule[] | null;
  staggerGen: number;
  togglePerm: (mIdx: number, pIdx: number, spIdx: number) => void;
}

export function UserDrawerPermsList({
  isLoading,
  perms,
  staggerGen,
  togglePerm,
}: IProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: T.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 12,
        }}
      >
        Права пользователя
      </div>
      {isLoading || !perms ? (
        <div style={{ fontSize: 13, color: T.textSecondary, padding: "6px 0" }}>
          Загрузка...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {perms.map((mod, mIdx) => (
            <div
              key={`${mod.module}-${staggerGen}`}
              style={{
                background: T.bg,
                borderRadius: 8,
                padding: "11px 14px",
                border: `1px solid ${T.border}`,
                animation: `permRowIn 200ms ease-out ${mIdx * 40}ms both`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.textPrimary,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {mod.module}
              </div>
              {mod.perms.map((perm, pIdx) => (
                <div
                  key={`${perm.label}-${pIdx}-${staggerGen}`}
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {perm.subperms &&
                    perm.subperms.map((sp, spIdx) => (
                      <div
                        key={`${sp.label}-${staggerGen}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: sp.value ? T.textPrimary : "#94A3B8",
                            fontWeight: sp.value ? 500 : 400,
                          }}
                        >
                          {sp.label}
                        </span>
                        <ToggleSwitch
                          checked={sp.value}
                          onChange={() => togglePerm(mIdx, pIdx, spIdx)}
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
