import { useModalState } from "@shared/lib";
import { ActionToolbar } from "@shared/ui";
import { DrawerActionsModal } from "@widgets/DrawerActionsModal";
import { TopNavigation } from "./ui/TopNavigation";
import { useState } from "react";
import { DocumentHeaderForm } from "./ui/DocumentHeaderForm";
import { Form } from "antd";
import { DocumentEditor } from "./ui/DocumentEditor";

export const InternalCorrespondece = () => {
  // Извлекаем правильные имена из хука: open и close
  const { open, close, isOpen } = useModalState();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Определяем классы для фона всей страницы
  // const bgClass = isDarkMode
  //   ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
  //   : "bg-gradient-to-br from-white via-gray-50 to-white text-gray-900";

  const [form] = Form.useForm();

  // 3. Создаем функцию отправки
  const onSendClick = async () => {
    try {
      // Это валидирует форму и собирает данные
      const values = await form.validateFields();

      console.log("Данные формы готовы к отправке:", values);
      // Тут будет выз��в API, например: await sendDocument(values);
      alert("Форма валидна, данные в консоли");
    } catch (errorInfo) {
      console.log("Ошибка валидации:", errorInfo);
      alert("Заполните обязательные поля!");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f9fafb]">
      <TopNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="max-w-4xl flex flex-col gap-4 mx-auto px-8 py-12">
        <DocumentHeaderForm isDarkMode={isDarkMode} form={form} />
        <DocumentEditor isDarkMode={isDarkMode} />
      </main>
      <DrawerActionsModal open={isOpen} onClose={close} />
      <ActionToolbar
        setIsInspectorOpen={open}
        setShowPreview={() => console.log("Просмотр")}
        handleSend={() => console.log("Отправить")}
        onSave={onSendClick}
      />
    </div>
  );
};
