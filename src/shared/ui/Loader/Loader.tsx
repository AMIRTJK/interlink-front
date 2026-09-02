import { Spin } from "antd";

interface ILoaderProps {
  height?: string | number;
  minHeight?: string | number;
  fullScreen?: boolean;
}

export const Loader = ({ height, minHeight, fullScreen = false }: ILoaderProps) => {
  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(2px)",
          pointerEvents: "none",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const resolvedHeight = height || "100%";
  const resolvedMinHeight = minHeight || "300px";

  return (
    <div
      style={{
        height: resolvedHeight,
        minHeight: resolvedMinHeight,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spin size="large" />
    </div>
  );
};
