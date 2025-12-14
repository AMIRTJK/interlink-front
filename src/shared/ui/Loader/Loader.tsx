import { Spin } from "antd";

export const Loader = () => (
  <div style={{ 
    height: "100vh", 
    width: "100%", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center" 
  }}>
    <Spin size="large" />
  </div>
);
