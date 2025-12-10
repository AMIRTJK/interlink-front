import { useState } from "react";
import { AddTaskForm } from "./AddTaskForm";
import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

export const Tasks = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <div className="profile-page">
      {!isFormVisible && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsFormVisible(true)}
            style={{
              width: "60px",
              height: "60px",
              fontSize: "24px",
            }}
          />
        </div>
      )}
      {isFormVisible && <AddTaskForm />}
    </div>
  );
};
