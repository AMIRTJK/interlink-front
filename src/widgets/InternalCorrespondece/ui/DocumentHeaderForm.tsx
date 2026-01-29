import "./style.css";
import React, { useState } from "react";
import { Input, DatePicker, Form, FormInstance } from "antd";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { Button } from "@shared/ui";

// Локализация для даты
dayjs.locale("ru");

interface DocumentHeaderFormProps {
  isDarkMode: boolean;
  form: FormInstance;
}

// Mock-данные
// const availableRecipients = [
//   {
//     id: "ivanov",
//     name: "Иванов Иван Иванович",
//     avatar:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
//   },
// ];

export const DocumentHeaderForm: React.FC<DocumentHeaderFormProps> = ({
  isDarkMode,
  form,
}) => {
  // Локальные стейты для отображения выбранных (в реальном проекте синхронизируйте с формой)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  // Хендлеры (заглушки)
  const handleRecipientClick = () => {
    // Пример добавления получателя для теста
    if (selectedRecipients.length === 0) {
      setSelectedRecipients(["ivanov"]);
    } else {
      alert("Модалка выбора получателей");
    }
  };

  const handleCCClick = () => {
    alert("Модалка выбора копии");
  };

  // Цветовые темы
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 font-sans">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(),
          number: "",
          subject: "",
        }}
      >
        {/* 1. ЗАГОЛОВОК (БОЛЬШОЙ) */}
        <Form.Item name="subject" className="mb-4">
          <Input
            placeholder="Заголовок документа..."
            variant="borderless"
            className="p-0! h-12! text-4xl! font-bold! text-gray-900! placeholder:text-4xl! placeholder:text-gray-300! dark:placeholder:text-gray-600! bg-transparent! border-none! focus:outline-none! focus:ring-0! transition-all!"
            autoComplete="off"
            styles={{
              input: {
                caretColor: "#A78BFA",
              },
            }}
          />
        </Form.Item>

        {/* 2. МЕТА-ДАННЫЕ (Row) */}
        <div className={`flex items-center gap-6 text-sm ${textSecondary}`}>
          {/* --- Блок: Получатель --- */}
          <div className="flex items-center gap-2">
            <Button
              antdIcon={<UserOutlined style={{ fontSize: "18px" }} />}
              type="text"
              text="Получатель"
              onClick={handleRecipientClick}
              className={`text-sm! ${textSecondary} text-[#4a5565]! px-0! hover:bg-transparent! hover:text-gray-600! dark:hover:text-gray-300! transition-colors!`}
            />
          </div>

          {/* --- Блок: Дата --- */}
          <div className="flex items-center gap-2">
            <ClockCircleOutlined style={{ fontSize: "18px" }} />
            <Form.Item name="date" noStyle rules={[{ required: true }]}>
              <DatePicker
                format="DD.MM.YYYY"
                variant="borderless"
                allowClear={false}
                suffixIcon={null}
                className={`!p-0 !text-sm ${textSecondary} hover:bg-transparent w-[90px]`}
                style={{ color: "inherit" }}
                inputReadOnly // Чтобы не открывалась клавиатура на мобильных, только пикер
              />
            </Form.Item>
          </div>

          {/* --- Блок: Номер --- */}
          <div className="flex items-center gap-2">
            <span className="font-semibold! text-[#4a5565]! dark:text-gray-200 text-sm!">
              №
            </span>
            <Form.Item name="number" noStyle>
              <Input
                placeholder="Введите номер"
                variant="borderless"
                className={`
                  px-0! py-0! h-auto! w-32! text-sm! ${textSecondary}
                  placeholder:text-sm!
                  rounded-none! border-b! border-gray-300! dark:border-gray-600!
                  focus:border-gray-400! focus:shadow-none! hover:bg-transparent!
                `}
                style={{
                  backgroundColor: "transparent",
                  lineHeight: "1.5",
                }}
                styles={{
                  input: {
                    caretColor: "#A78BFA",
                  },
                }}
              />
            </Form.Item>
          </div>
        </div>

        {/* 3. КОПИЯ */}
        <div className="flex items-center gap-4 mt-3">
          <Button
            type="text"
            onClick={handleCCClick}
            className={`text-sm ${textSecondary}`}
          />
          Копия (необязательно)
        </div>
      </Form>
    </div>
  );
};
