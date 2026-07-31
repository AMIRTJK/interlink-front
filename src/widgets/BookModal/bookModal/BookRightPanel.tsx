import React from "react";
import downLoadLetterIcon from "../../../assets/icons/dowload-letter-icon.svg";
import downloadAllFilesIcon from "../../../assets/icons/download-all-files-icon.svg";
import { FileItem, FILES } from "./bookModalModel";

interface BookRightPanelProps {
  currentFile: FileItem;
  onFileSelect: (file: FileItem) => void;
  onDownload: () => void;
  onClose: () => void;
  toNavigate: () => void;
}

export const BookRightPanel: React.FC<BookRightPanelProps> = ({
  currentFile,
  onFileSelect,
  onDownload,
  onClose,
  toNavigate,
}) => {
  return (
    <div className="content">
      <div className="modal-header-half">
        <button className="close-btn" onClick={onClose}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 1L1 13M1 1L13 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="body-half body-right">
        <div className="section-title">Вложения</div>
        <div className="action-links">
          <a onClick={onDownload} className="action-link">
            <img
              src={downLoadLetterIcon}
              alt="Download Letter"
              width="18"
              height="18"
            />
            Скачать письмо
          </a>
          <a onClick={onDownload} className="action-link">
            <img
              src={downloadAllFilesIcon}
              alt="Download All"
              width="18"
              height="18"
            />
            Скачать все файлы
          </a>
        </div>

        <div className="attachments-grid">
          {FILES.map((file, idx) => (
            <div
              key={idx}
              className={`file-card ${currentFile.type === file.type ? "active" : ""}`}
              onClick={() => onFileSelect(file)}
            >
              <div
                className="file-icon"
                style={{ background: "transparent" }}
              >
                <img
                  src={file.iconSrc}
                  alt={file.type}
                  style={{ width: "36px", height: "36px" }}
                />
              </div>
              <div className="file-name">{file.name}</div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline-red" onClick={onClose}>
            Отказать
          </button>
          <button className="btn btn-outline-blue">Ознакомлен</button>
          <button onClick={toNavigate} className="btn btn-solid-blue">
            Создать визу
          </button>
        </div>
      </div>
    </div>
  );
};
