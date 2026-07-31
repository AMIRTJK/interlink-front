import { Upload } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import { PlusOutlined } from "@ant-design/icons";

interface IProps {
  onUploadChange: (info: UploadChangeParam) => void;
  isAllowed: boolean;
}

/** Зона перетаскивания файлов резолюции. */
export const ResolutionUploadZone = ({
  onUploadChange,
  isAllowed,
}: IProps) => (
  <div className="resolution__upload-section bg-[white]!">
    <Upload.Dragger
      className="resolution__dragger"
      multiple
      onChange={onUploadChange}
      beforeUpload={() => false}
      showUploadList={false}
      disabled={!isAllowed}
    >
      <p className="resolution__upload-title">Загрузить файлы</p>
      <div className="resolution__dragger-content">
        <div className="resolution__dragger-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>
        <p className="resolution__dragger-text">
          Перетащите файлы сюда или нажмите для выбора
        </p>
        <div className="resolution__dragger-plus">
          <PlusOutlined style={{ color: "white", fontSize: "16px" }} />
        </div>
      </div>
    </Upload.Dragger>
  </div>
);
