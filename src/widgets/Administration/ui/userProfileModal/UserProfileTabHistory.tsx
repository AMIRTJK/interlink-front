import { Activity } from "lucide-react";
import { T } from "../../theme/tokens";
import type { HistoryItem } from "../../model";

interface IUserProfileTabHistoryProps {
  historyItems: HistoryItem[];
}

export function UserProfileTabHistory({
  historyItems,
}: IUserProfileTabHistoryProps) {
  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {historyItems.map((h, idx) => (
          <div
            key={idx}
            style={{ display: "flex", gap: 14 }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                paddingTop: 4,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Activity size={12} color={T.accent} />
              </div>
              {idx < historyItems.length - 1 && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 12,
                    background: T.border,
                    marginTop: 4,
                    marginBottom: -10,
                  }}
                />
              )}
            </div>
            <div
              style={{
                background: T.surface,
                borderRadius: 10,
                padding: "12px 16px",
                border: `1px solid ${T.border}`,
                flex: 1,
                boxShadow: T.shadow,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: T.textPrimary,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                {h.action}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#94A3B8",
                  marginTop: 4,
                }}
              >
                {h.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
