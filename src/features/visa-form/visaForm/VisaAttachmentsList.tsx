import fileListIcon from "../../../assets/icons/file-list-icon.svg";
import { IAttachment } from "../lib";

const handleDownloadFile = (file: IAttachment) => {
  const link = document.createElement("a");
  link.href = file.url;
  link.download = file.original_name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/** Список прикреплённых файлов визы: открытие в новой вкладке и скачивание. */
export const VisaAttachmentsList = ({ files }: { files: IAttachment[] }) => {
  if (files.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 mt-4 pb-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white p-3 rounded-2xl border border-[#BCC5DF]/40 flex items-center justify-between gap-3 hover:border-[#0037AF]/40 transition-colors group relative"
        >
          <div
            className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
            onClick={() => window.open(file.url, "_blank")}
          >
            <img src={fileListIcon} className="h-8 w-8" />
            <span className="text-[#0037AF] text-sm font-medium truncate">
              {file.original_name}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadFile(file);
            }}
            className="shrink-0 w-8 h-8 rounded-full bg-[#BCC5DF] flex items-center justify-center text-white hover:bg-[#0037AF] hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
