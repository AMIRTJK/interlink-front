import * as React from "react";
import { ChevronDown } from "lucide-react";
import { T } from "../theme/tokens";

export const CustomDropdown = ({
  value,
  onChange,
  placeholder,
  options,
  width,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  width: number;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width,
        fontFamily: T.font,
        userSelect: "none",
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          height: 36,
          background: T.surface,
          border: `1px solid ${isOpen ? T.accent : T.border}`,
          borderRadius: 8,
          fontSize: 13,
          color: value ? T.textPrimary : "#94A3B8",
          cursor: "pointer",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: isOpen ? `0 0 0 2px ${T.accent}20` : "none",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = T.accent;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = T.border;
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          color={value ? T.textSecondary : "#94A3B8"}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
            flexShrink: 0,
            marginLeft: 6,
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            boxShadow: T.shadowMd,
            zIndex: 1000,
            maxHeight: 220,
            overflowY: "auto",
            padding: "4px",
            animation: "fieldsSlideDown 150ms ease-out forwards",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value || null);
                  setIsOpen(false);
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  fontSize: 13,
                  color: isSelected ? T.accent : T.textPrimary,
                  background: isSelected ? `${T.accent}0D` : "transparent",
                  fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer",
                  transition: "background 0.12s, color 0.12s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = T.hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {opt.label}
                </span>
                {isSelected && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: T.accent,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
