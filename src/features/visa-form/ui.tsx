import React, { useState } from "react";
import { Col, Form, message, Row, Upload, type UploadProps } from "antd";
import { Button, DateField, SelectField, TextField } from "@shared/ui";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

import dateIcon from "../../assets/icons/date-icon.svg";
import arrowBottomIcon from "../../assets/icons/arrow-bottom-icon.svg";
import fileListIcon from "../../assets/icons/file-list-icon.svg";
import { IAttachment, mockFiles } from "./lib";

interface VisaFormProps {
  correspondenceId?: number;
  className?: string; // Самый важный проп для встраивания
  onSuccess?: () => void; // Если нужно закрыть модалку после успеха
}

export const VisaForm: React.FC<VisaFormProps> = ({
  correspondenceId,
  className,
  onSuccess,
}) => {
  const [fileList, setFileList] = useState<IAttachment[]>(mockFiles);
  const [isFormValid, setIsFormValid] = useState(false);
  const [form] = Form.useForm();

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

  // --- Handlers ---
  const handleUpload: UploadProps["customRequest"] = (options) => {
    const { file, onSuccess: onUploadSuccess, onError } = options;
    const formData = new FormData();
    formData.append("files[]", file as Blob);

    uploadFilesBulk(formData, {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          setFileList((prev) => [...prev, ...data]);
          message.success(`${(file as File).name} успешно загружен`);
          if (onUploadSuccess) onUploadSuccess(data);
        } else {
          setFileList((prev) => [...prev, data as IAttachment]);
          if (onUploadSuccess) onUploadSuccess(data);
        }
      },
      onError: (err) => {
        if (onError) onError(err);
      },
    });
  };

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

  const handleFormChange = (
    _: unknown,
    allValues: { due_at: unknown; note: string; status: string },
  ) => {
    const { due_at, note, status } = allValues;
    const isValid = !!due_at && !!note && !!status;
    setIsFormValid(isValid);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.log("Submit values:", values, fileList);
      message.success("Виза создана!");
      if (onSuccess) onSuccess();
    });
  };

  const FileIconBlue = () => <img src={fileListIcon} className="h-8 w-8" />;

  return (
    <div
      className={`flex flex-col h-full overflow-y-auto custom-scroll ${className || ""}`}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onValuesChange={handleFormChange}
        className="flex-1"
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
              suffixIcon={<img src={dateIcon} alt="" />}
            />
          </Col>
          <Col span={24}>
            <TextField
              label=""
              name="note"
              placeholder="Виза"
              rules={[{ required: true, message: "Заполните поле" }]}
              className="h-14 rounded-lg! placeholder:text-[#BCC5DF]!"
            />
          </Col>
          <Col span={24}>
            <SelectField
              rules={[{ required: true, message: "Заполните поле" }]}
              label=""
              name="status"
              placeholder="Статус"
              showSearch
              allowClear
              options={statusOptions}
              className="!mb-0"
              style={{ height: "56px", borderRadius: "8px" }}
              suffixIcon={<img src={arrowBottomIcon} alt="" />}
            />
          </Col>
          <Col span={24}>
            <button
              type="button"
              className="w-full cursor-pointer bg-white border border-[#0037af] text-[#0037AF] rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-all group active:transform active:scale-[0.98]"
            >
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
                  {isUploading ? "Загрузка..." : "Прикрепить файл (макс 20МБ)"}
                </span>
              </div>
            </Upload>

            {fileList.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mt-4 pb-2">
                {fileList.map((file) => (
                  <div
                    key={file.id}
                    className={`bg-white p-3 rounded-2xl border border-[#BCC5DF]/40 flex items-center justify-between gap-3 hover:border-[#0037AF]/40 transition-colors group relative ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
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

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 text-gray-400 hover:text-red-500 shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-90"
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
        <Button
          type="text"
          text="Визировать"
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`
            w-full! h-12! font-medium! py-3.5! rounded-xl! shadow-lg! shadow-gray-200! transition-all!
            ${
              isFormValid
                ? "bg-[#0037AF]! text-white! cursor-pointer! hover:bg-[#002d90]! active:transform! active:scale-[0.98]!"
                : "bg-[#A0A0A0]! text-white! cursor-not-allowed!"
            }
          `}
        />
      </div>
    </div>
  );
};
