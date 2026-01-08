import React from "react";
import { Button } from "antd";
import { IDocFile } from "../model";
// Импорт иконок файлов
import pdfIcon from "../../../assets/icons/Pdf.svg";
import excelIcon from "../../../assets/icons/excel.svg";
import wordIcon from "../../../assets/icons/word.svg";
// Импорт иконок действий
import downLoadAll from "../../../assets/icons/download.svg";
import downLoadLetter from "../../../assets/icons/letter-download.svg";
interface IProps {
  files: IDocFile[];
  activeFileId?: number;
  onFileSelect: (file: IDocFile) => void;
  setIsSetExecutor:React.Dispatch<React.SetStateAction<boolean>>
}


export const DocSidebar: React.FC<IProps> = ({
  files,
  activeFileId,
  onFileSelect,
  setIsSetExecutor
}) => {
  // Карта иконок
const ICON_MAP: Record<string, string> = {
  pdf: pdfIcon,
  xls: excelIcon,
  doc: wordIcon,
};


  return (
    <div className="docView__right">
      <h4 className="docView__right-title">Вложения</h4>
      <div className="docView__right-files">
        {files?.map((file) => (
          <div
            key={file.id}
            className={`file-card ${activeFileId === file.id ? "active" : ""}`}
            onClick={() => onFileSelect(file)}
          >
            {/* Иконка через img */}
            <img
              src={ICON_MAP[file.type] || pdfIcon}
              alt={file.type}
              className="file-card-icon"
            />
            <span className="file-name">{file.name}</span>
          </div>
        ))}
      </div>

      <div className="docView__right-crud">
        <Button
          type="link"
          className="btn-link-style"
          icon={<img src={downLoadLetter} alt="" />}
        >
          Скачать письмо
        </Button>
        <Button
          type="link"
          className="btn-link-style"
          icon={<img src={downLoadAll} alt="" />}
        >
          Скачать все файлы
        </Button>
      </div>

      <div className="docView__right-actions">
        <Button danger className="action-btn">
          Отказать
        </Button>
        <Button className="action-btn">Ознакомлен</Button>
        <Button onClick={()=>setIsSetExecutor(true)} type="primary" className="action-btn">
           Визировать
        </Button>
      </div>
    </div>
  );
};
