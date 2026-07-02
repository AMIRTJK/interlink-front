import { Spin } from "antd";

interface ILoaderProps {
  height?: string | number;
  minHeight?: string | number;
  fullScreen?: boolean;
}

export const Loader = ({ height, minHeight, fullScreen = false }: ILoaderProps) => {
  const resolvedHeight = height || (fullScreen ? "100vh" : "100%");
  const resolvedMinHeight = minHeight || (fullScreen ? "100vh" : "300px");

  return (
    <div style={{ 
      height: resolvedHeight,
      minHeight: resolvedMinHeight,
      width: "100%", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center" 
    }}>
      <Spin size="large" />
    </div>
  );
};
