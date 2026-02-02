import { useModalState } from "@shared/lib";
import { ActionToolbar } from "@shared/ui";
import { DrawerActionsModal } from "@widgets/DrawerActionsModal";
import { TopNavigation } from "./ui/TopNavigation";
import { useState } from "react";
import { DocumentHeaderForm } from "./ui/DocumentHeaderForm";
import { Form, Modal } from "antd";
import { useParams } from "react-router";
import { DocumentEditor } from "./ui/DocumentEditor";

interface IProps {
  mode: "create" | "show";
}

export const InternalCorrespondece: React.FC<IProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const { open, close, isOpen } = useModalState();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentMode, setCurrentMode] = useState<"create" | "show">(mode);

  // Определяем классы для фона всей страницы
  // const bgClass = isDarkMode
  //   ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
  //   : "bg-gradient-to-br from-white via-gray-50 to-white text-gray-900";

  const [form] = Form.useForm();

  const handleReply = () => {
    setCurrentMode("create");
    close();
  };

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
    <div
      className={`relative min-h-screen bg-[#f9fafb] ${isOpen ? "max-h-[768px] overflow-hidden" : ""}`}
    >
      <TopNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="max-w-4xl flex flex-col gap-4 mx-auto px-8 py-12">
        <DocumentHeaderForm isDarkMode={isDarkMode} form={form} />
        <DocumentEditor isDarkMode={isDarkMode} mode={currentMode} />
      </main>
      <DrawerActionsModal
        open={isOpen}
        onClose={close}
        docId={id}
        mode={currentMode}
        onReply={handleReply}
      />
      <ActionToolbar
        setIsInspectorOpen={open}
        setShowPreview={() => setIsPreviewOpen(true)}
        handleSend={() => console.log("Отправить")}
        onSave={onSendClick}
        mode={currentMode}
      />
      <Modal
        title="Предварительный просмотр"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width={1000}
        centered
        destroyOnClose
        bodyStyle={{ height: "80vh", padding: 0, overflow: "hidden" }}
      >
        <div className="p-4 bg-gray-100 rounded-lg max-h-[80vh] overflow-y-auto">
          <DocumentEditor isDarkMode={isDarkMode} mode="show" />
        </div>
      </Modal>
    </div>
  );
};
