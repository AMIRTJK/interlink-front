import "./style.css";
import React, { useState, useEffect, useMemo } from "react";
import { Input, DatePicker, Form, FormInstance, Avatar, Tooltip } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Button, If } from "@shared/ui"; // Импортируем твой If
// useModalState нам больше не нужен, мы будем управлять состоянием через локальный стейт типа
import { RecipientSelectorModal } from "./RecipientSelectorModal";
import { SelectedRecipientsModal } from "./SelectedRecipientsModal";
import { ApiRoutes } from "@shared/api";
import { requiredRule } from "@shared/lib";

dayjs.locale("ru");

interface DocumentHeaderFormProps {
  isDarkMode: boolean;
  form: FormInstance;
  initialRecipients?: Recipient[];
  initialCC?: Recipient[];
}

export interface Recipient {
  id: number;
  full_name: string;
  position: string;
  photo_path: string | null;
}

type SelectionMode = "recipients" | "copy" | null;

export const DocumentHeaderForm: React.FC<DocumentHeaderFormProps> = ({
  isDarkMode,
  form,
  initialRecipients = [],
  initialCC = [],
}) => {
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [selectedCC, setSelectedCC] = useState<Recipient[]>([]);

  const [activeSelectorMode, setActiveSelectorMode] =
    useState<SelectionMode>(null);
  const [activeViewerMode, setActiveViewerMode] = useState<SelectionMode>(null);

  useEffect(() => {
    form.setFieldsValue({
      recipients: selectedRecipients.map((r) => r.id),
      copy: selectedCC.map((r) => r.id),
    });
  }, [selectedRecipients, selectedCC, form]);

  const closeSelector = () => setActiveSelectorMode(null);
  const closeViewer = () => setActiveViewerMode(null);

  const selectorProps = useMemo(() => {
    if (activeSelectorMode === "recipients") {
      return {
        selected: selectedRecipients,
        onChange: setSelectedRecipients,
        title: "Выбор получателей",
      };
    }
    if (activeSelectorMode === "copy") {
      return {
        selected: selectedCC,
        onChange: setSelectedCC,
        title: "Выбор получателей копии",
      };
    }
    return { selected: [], onChange: () => {}, title: "" };
  }, [activeSelectorMode, selectedRecipients, selectedCC]);

  const viewerProps = useMemo(() => {
    if (activeViewerMode === "recipients") {
      return {
        list: selectedRecipients,
        onRemove: (id: number) =>
          setSelectedRecipients((prev) => prev.filter((r) => r.id !== id)),
      };
    }
    if (activeViewerMode === "copy") {
      return {
        list: selectedCC,
        onRemove: (id: number) =>
          setSelectedCC((prev) => prev.filter((r) => r.id !== id)),
      };
    }
    return { list: [], onRemove: () => {} };
  }, [activeViewerMode, selectedRecipients, selectedCC]);

  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-500";
  const chipClass = isDarkMode
    ? "bg-[#1f2937] border-gray-700 text-gray-200 hover:border-gray-500"
    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300";

  const renderSelectionArea = (
    list: Recipient[],
    mode: SelectionMode,
    emptyText: string,
    emptyIcon: React.ReactNode,
  ) => {
    if (list.length === 0) {
      return (
        <Button
          antdIcon={emptyIcon}
          type="text"
          text={emptyText}
          onClick={() => setActiveSelectorMode(mode)}
          className={`text-sm! ${textSecondary} text-[#4a5565]! px-0! hover:bg-transparent! hover:text-gray-400! dark:hover:text-gray-300! transition-colors!`}
        />
      );
    }

    const MAX_VISIBLE = 2;
    const visibleUsers = list.slice(0, MAX_VISIBLE);
    const hiddenCount = list.length - MAX_VISIBLE;
    const hiddenNames = list
      .slice(MAX_VISIBLE)
      .map((u) => u.full_name)
      .join(", ");

    return (
      <div className="flex flex-wrap items-center gap-2">
        {visibleUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => setActiveViewerMode(mode)}
            className={`
              flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border cursor-pointer transition-all shadow-sm select-none
              ${chipClass}
            `}
          >
            <Avatar src={user.photo_path} size={24} icon={<UserOutlined />} />
            <span className="text-xs font-medium whitespace-nowrap">
              {user.full_name}
            </span>
          </div>
        ))}

        {hiddenCount > 0 && (
          <Tooltip title={`Показать скрытых: ${hiddenNames}`}>
            <div
              onClick={() => setActiveViewerMode(mode)}
              className={`
                flex items-center justify-center h-[34px] min-w-[34px] px-2 rounded-full border cursor-pointer transition-all shadow-sm
                ${chipClass}
              `}
            >
              <span className="text-xs font-semibold">+{hiddenCount}</span>
            </div>
          </Tooltip>
        )}

        <Button
          antdIcon={<PlusOutlined style={{ fontSize: "12px" }} />}
          type="text"
          onClick={() => setActiveSelectorMode(mode)}
          className={`
            min-w-[32px]! h-[32px]! w-[32px]! rounded-full! flex items-center justify-center p-0!
            ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800
          `}
        />
      </div>
    );
  };

  return (
    <div className="">
      <Form
        form={form}
        layout="vertical"
        className="flex flex-col gap-3"
        initialValues={{
          date: dayjs(),
          number: "",
          subject: "",
          recipients: [],
          copy: [],
        }}
      >
        <Form.Item name="recipients" rules={[requiredRule]} hidden>
          <Input />
        </Form.Item>
        <Form.Item name="copy" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="subject" className="mb-4" rules={[requiredRule]}>
          <Input
            placeholder="Заголовок документа..."
            variant="borderless"
            className="p-0! h-12! text-4xl! font-bold! text-gray-900! placeholder:text-4xl! placeholder:text-gray-300! dark:placeholder:text-gray-600! bg-transparent! border-none! focus:outline-none! focus:ring-0! transition-all!"
            autoComplete="off"
            styles={{ input: { caretColor: "#A78BFA" } }}
          />
        </Form.Item>

        <div
          className={`flex flex-wrap items-center gap-y-2 gap-x-6 text-sm ${textSecondary}`}
        >
          <div className="flex items-center min-h-[32px]">
            {renderSelectionArea(
              selectedRecipients,
              "recipients",
              "Получатель",
              <UserOutlined style={{ fontSize: "14px" }} />,
            )}
          </div>

          <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <ClockCircleOutlined style={{ fontSize: "14px" }} />
            <Form.Item name="date" noStyle>
              <DatePicker
                format="DD.MM.YYYY"
                variant="borderless"
                allowClear={false}
                suffixIcon={null}
                className={`p-0! text-sm! max-w-[90px] ${textSecondary} text-[#4a5565]! px-0! hover:bg-transparent! hover:text-gray-400! dark:hover:text-gray-300! transition-colors!`}
                style={{ color: "inherit" }}
                inputReadOnly
                disabled
              />
            </Form.Item>
          </div>

          <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <span className="font-semibold! text-[#4a5565]! dark:text-gray-200 text-sm!">
              №
            </span>
            <Form.Item name="number" noStyle>
              <Input
                disabled
                placeholder="Номер письма"
                variant="borderless"
                className={`
                  px-0! py-0! h-auto! w-32! text-sm! ${textSecondary}
                  placeholder:text-sm!
                  rounded-none! border-b! border-gray-300! dark:border-gray-600!
                  focus:border-gray-400! focus:shadow-none! hover:bg-transparent!
                `}
                style={{ backgroundColor: "transparent", lineHeight: "1.5" }}
                styles={{ input: { caretColor: "#A78BFA" } }}
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-1 min-h-[32px]">
          {renderSelectionArea(
            selectedCC,
            "copy",
            "Копия (необязательно)",
            <CopyOutlined style={{ fontSize: "14px" }} />,
          )}
        </div>
      </Form>

      <If is={activeSelectorMode !== null}>
        <RecipientSelectorModal
          isOpen={true}
          onClose={closeSelector}
          isDarkMode={isDarkMode}
          api={ApiRoutes.GET_USERS}
          selectedRecipients={selectorProps.selected}
          onChange={selectorProps.onChange}
          title={selectorProps.title}
        />
      </If>

      <If is={activeViewerMode !== null}>
        <SelectedRecipientsModal
          isOpen={true}
          onClose={closeViewer}
          isDarkMode={isDarkMode}
          recipients={viewerProps.list}
          onRemove={viewerProps.onRemove}
        />
      </If>
    </div>
  );
};
