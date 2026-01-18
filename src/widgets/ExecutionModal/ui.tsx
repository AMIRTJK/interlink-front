import { DateField, SelectField, TextField } from "@shared/ui";
import { Col, Form, message, Row, Upload, type UploadProps } from "antd";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import dateIcon from "../../assets/icons/date-icon.svg";
import arrowBottomIcon from "../../assets/icons/arrow-bottom-icon.svg";
import fileListIcon from "../../assets/icons/file-list-icon.svg";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  correspondenceId?: number;
}

interface IAttachment {
  id: number;
  correspondence_id: number;
  uploaded_by: number;
  original_name: string;
  mime: string;
  size: number;
  path: string;
  url: string;
  created_at: string;
}

export const ExecutionModal: React.FC<ExecutionModalProps> = ({
  isOpen,
  onClose,
  correspondenceId,
}) => {
  const mockFiles: IAttachment[] = [
    {
      id: 1,
      correspondence_id: 101,
      uploaded_by: 5,
      original_name: "Приказ_о_назначении_№123.pdf",
      mime: "application/pdf",
      size: 2560000, // ~2.4 MB
      path: "/path/to/file1",
      url: "#",
      created_at: "2023-10-25T10:00:00Z",
    },
    {
      id: 2,
      correspondence_id: 101,
      uploaded_by: 5,
      original_name: "Скриншот_ошибки_системы.jpg",
      mime: "image/jpeg", // Проверка логики IMG
      size: 512000, // 500 KB
      path: "/path/to/file2",
      url: "#",
      created_at: "2023-10-25T10:05:00Z",
    },
    {
      id: 3,
      correspondence_id: 101,
      uploaded_by: 5,
      original_name:
        "Очень_длинное_название_файла_для_теста_верстки_и_обрезки_текста.docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 102400, // 100 KB
      path: "/path/to/file3",
      url: "#",
      created_at: "2023-10-25T10:10:00Z",
    },
  ];

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fileList, setFileList] = useState<IAttachment[]>(mockFiles);
  const [isFormValid, setIsFormValid] = useState(false);

  const [form] = Form.useForm();

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const statusOptions = [
    { label: "Фаврӣ", value: "Фаврӣ" },
    { label: "Назоратӣ", value: "Назоратӣ" },
  ];

  const { mutate: uploadFilesBulk, isPending: isUploading } = useMutationQuery<
    FormData,
    IAttachment[]
  >({
    url: ApiRoutes.UPLOAD_CORRESPONDENCE_ATTACHMENTS_BULK.replace(
      ":id",
      String(correspondenceId || ""),
    ),
    method: "POST",
  });

  const handleUpload: UploadProps["customRequest"] = (options) => {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append("files[]", file as Blob);

    uploadFilesBulk(formData, {
      onSuccess: (data) => {
        console.log(data);

        if (Array.isArray(data)) {
          setFileList((prev) => [...prev, ...data]);
          message.success(`${(file as File).name} успешно загружен`);
          if (onSuccess) onSuccess(data);
        } else {
          setFileList((prev) => [...prev, data as IAttachment]);
          if (onSuccess) onSuccess(data);
        }
      },
      onError: (err) => {
        if (onError) onError(err);
      },
    });
  };

  const { mutate: deleteFile, isPending: isDeleting } = useMutationQuery<
    number,
    unknown
  >({
    url: (id) => `/api/v1/correspondence-attachments/${id}`,
    method: "DELETE",
    messages: {
      success: "Файл удален",
      error: "Не удалось удалить файл",
    },
  });

  const handleRemoveFile = (attachmentId: number) => {
    deleteFile(attachmentId, {
      onSuccess: () => {
        setFileList((prev) => prev.filter((item) => item.id !== attachmentId));
      },
    });
  };

  const handleDownloadFile = (file: IAttachment) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const getFileExtension = (filename: string) => {
  //   return filename.split(".").pop()?.toUpperCase() || "FILE";
  // };

  const FileIconBlue = () => <img src={fileListIcon} className="h-8 w-8" />;

  const handleFormChange = (
    _: unknown,
    allValues: { due_at: unknown; note: string; status: string },
  ) => {
    const { due_at, note, status } = allValues;
    const isValid = !!due_at && !!note && !!status;
    setIsFormValid(isValid);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-700/60 backdrop-blur-sm overflow-hidden animate-fade-in">
      <div
        className={`
          bg-white shadow-2xl flex flex-col overflow-hidden md:p-6 relative transition-all duration-300 ease-in-out
          ${
            isFullScreen
              ? "w-full h-full rounded-none"
              : "w-full h-full md:w-[calc(100vw-100px)] md:h-[calc(100vh-100px)] rounded-none md:rounded-2xl"
          }
        `}
      >
        <div className="flex items-center justify-between md:pb-2 md:mb-4  border-b border-gray-100 bg-white z-20 shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Резолюция
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="hidden cursor-pointer md:block p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Развернуть/Свернуть"
            >
              {isFullScreen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden bg-[#F5F7FB]  md:bg-white">
          <div className="w-full md:w-96 md:rounded-2xl bg-[#F2F5FF] flex flex-col p-4 md:p-4 md:overflow-y-auto custom-scroll border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0">
            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
              onValuesChange={handleFormChange}
              // onFinish={handleSubmit}
            >
              <Row gutter={[20, 16]}>
                <Col span={24}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <img
                      src="https://i.pravatar.cc/150?img=11"
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        Сайдазимов Сохиб
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Старший специалист
                      </p>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <DateField
                    className="w-full h-14! rounded-lg! [&_input::placeholder]:text-base [&_input::placeholder]:text-[#BCC5DF]!"
                    name="due_at"
                    label=""
                    rules={[{ required: true, message: "Выберите дату" }]}
                    placeholder="Срок"
                    suffixIcon={<img src={dateIcon}></img>}
                  />
                </Col>
                <Col span={24}>
                  <TextField
                    label=""
                    name="note"
                    placeholder="Виза"
                    rules={[
                      {
                        required: true,
                        message: "Заполните поле",
                      },
                    ]}
                    className="h-14 rounded-lg! placeholder:text-[#BCC5DF]!"
                  />
                </Col>
                <Col span={24}>
                  <SelectField
                    rules={[
                      {
                        required: true,
                        message: "Заполните поле",
                      },
                    ]}
                    label=""
                    name="status"
                    placeholder="Статус"
                    showSearch
                    allowClear
                    options={statusOptions}
                    className="!mb-0"
                    style={{
                      height: "56px",
                      borderRadius: "8px",
                    }}
                    suffixIcon={<img src={arrowBottomIcon}></img>}
                  />
                </Col>
                <Col span={24}>
                  <button className="w-full cursor-pointer bg-white border border-[#0037af] text-[#0037AF] rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-all group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Назначить исполнителей
                  </button>
                </Col>
                <Col span={24}>
                  <Upload
                    customRequest={handleUpload}
                    showUploadList={false}
                    multiple={true}
                    maxCount={10}
                    disabled={isUploading}
                    className="block! [&>div]:w-full!"
                  >
                    <div className="flex items-center justify-center w-full px-4 py-3 bg-white border border-[#0037af]! border-dashed rounded-lg hover:bg-blue-50 transition-all cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-[#0037af]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                        />
                      </svg>
                      <span className="text-sm text-[#0037af] font-medium">
                        {isUploading
                          ? "Загрузка..."
                          : "Прикрепить файл (макс 20МБ)"}
                      </span>
                    </div>
                  </Upload>

                  {fileList.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 mt-4">
                      {fileList.map((file) => (
                        <div
                          key={file.id}
                          className={`
                            bg-white p-3 rounded-2xl border border-[#BCC5DF]/40 
                            flex items-center justify-between gap-3
                            hover:border-[#0037AF]/40 transition-colors group relative
                            ${isDeleting ? "opacity-50 pointer-events-none" : ""}
                          `}
                        >
                          <div
                            className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            <FileIconBlue />
                            <span className="text-[#0037AF] text-sm font-medium truncate">
                              {file.original_name}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file);
                            }}
                            className="
                              shrink-0 w-8 h-8 rounded-full bg-[#BCC5DF] 
                              flex items-center justify-center 
                              text-white hover:bg-[#0037AF] hover:text-white transition-colors
                            "
                            title="Скачать"
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

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(file.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 text-gray-400 hover:text-red-500 shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-90"
                            title="Удалить файл"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3 h-3"
                            >
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Col>
              </Row>
            </Form>

            <div className="mt-auto pt-4">
              <button
                disabled={!isFormValid}
                className={`
                  w-full font-medium py-3.5 rounded-xl shadow-lg shadow-gray-200 transition-all
                  ${
                    isFormValid
                      ? "bg-[#0037AF] text-white cursor-pointer hover:bg-[#002d90] active:transform active:scale-[0.98]"
                      : "bg-[#A0A0A0] text-white cursor-not-allowed"
                  }
                `}
              >
                Визировать
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white relative flex flex-col items-center justify-center p-6 md:p-10 text-center min-h-[300px]">
            <div className="flex flex-col items-center max-w-md w-full animate-fade-in">
              <div className="mb-5 text-blue-100 bg-blue-50 p-6 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-16 h-16 text-blue-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Исполнители не назначены
              </h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Пожалуйста, выберите ответственных лиц в левой панели,
                <br className="hidden md:block" /> чтобы продолжить процесс
                визирования.
              </p>

              <button className="flex cursor-pointer items-center gap-2 text-[#0037AF] font-semibold hover:text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Назначить исполнителей
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Рендерим в document.body чтобы перекрыть всё
  return createPortal(modalContent, document.body);
};
