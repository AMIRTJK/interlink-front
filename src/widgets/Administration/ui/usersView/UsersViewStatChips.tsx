import * as React from "react";
import { T } from "../../theme/tokens";

interface IProps {
  statChips: {
    label: string;
    value: number;
    dot: string | null;
  }[];
}

export function UsersViewStatChips({ statChips }: IProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {statChips.map((chip) => (
        <div
          key={chip.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            padding: "4px 10px",
            boxShadow: T.shadow,
          }}
        >
          {chip.dot && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: chip.dot,
                display: "inline-block",
              }}
            />
          )}
          <span
            style={{ fontSize: 12, color: T.textSecondary, fontWeight: 500 }}
          >
            {chip.label}
          </span>
          <span
            style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}
          >
            {chip.value}
          </span>
        </div>
      ))}
    </div>
  );
}
