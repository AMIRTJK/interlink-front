import dayjsLib from "dayjs";
import { useModalState, useMutationQuery } from "@shared/lib";
import { ActionToolbar } from "@shared/ui";
import { DrawerActionsModal } from "@widgets/DrawerActionsModal";
import { TopNavigation } from "./ui/TopNavigation";
import { useEffect, useState } from "react";
import { DocumentHeaderForm, Recipient } from "./ui/DocumentHeaderForm";
import { Form, Modal } from "antd";
import { useParams } from "react-router";
import { DocumentEditor } from "./ui/DocumentEditor";
import {
  CreateInternalRequest,
  InternalCorrespondenceResponse,
} from "@entities/correspondence";
import { ApiRoutes } from "@shared/api";

interface IProps {
  mode: "create" | "show";
  initialData?: InternalCorrespondenceResponse;
  isLoading?: boolean;
}

export const InternalCorrespondece: React.FC<IProps> = ({
  mode,
  initialData,
  isLoading,
}) => {
  const { id } = useParams<{ id: string }>();
  const { open, close, isOpen } = useModalState();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentMode, setCurrentMode] = useState<"create" | "show">(mode);

  const [initialRecipients, setInitialRecipients] = useState<any[]>([]);
  const [initialCC, setInitialCC] = useState<any[]>([]);
  // Состояние для начального контента редактора
  const [initialEditorContent, setInitialEditorContent] = useState<string>("");

  // Определяем классы для фона всей страницы
  // const bgClass = isDarkMode
  //   ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
  //   : "bg-gradient-to-br from-white via-gray-50 to-white text-gray-900";

  const [form] = Form.useForm();

  const [editorBody, setEditorBody] = useState<string>("");

  const handleReply = () => {
    setCurrentMode("create");
    close();
  };

  const {
    mutate: sendForm,
    isPending,
    isAllowed,
  } = useMutationQuery<CreateInternalRequest>({
    url: ApiRoutes.CREATE_INTERNAL,
    method: "POST",
    messages: {
      invalidate: [ApiRoutes.GET_INTERNAL_DRAFTS],
    },
    preload: true,
    preloadConditional: ["internal_correspondence.create"],
  });

  // 3. Создаем функцию отправки
  const onSendClick = async () => {
    try {
      // Валидируем форму (тема, получатели, дата)
      const values = await form.validateFields();

      // Проверка на пустой редактор (опционально)
      if (!editorBody || editorBody.trim() === "") {
        alert("Тело документа не может быть пустым!");
        return;
      }

      // 3. Формируем структуру запроса, которую вы описали
      const requestPayload = {
        subject: values.subject, // Из инпута формы
        body: editorBody, // HTML из CKEditor (<p>Текст</p>)
        recipients: {
          to: values.recipients, // Массив ID [2, 3...]
          // copy: values.copy (пока игнорируем, как вы и просили)
        },
      };

      console.log("Отправляем на бэк:", requestPayload);

      // Отправляем запрос
      sendForm(requestPayload);
    } catch (errorInfo) {
      console.log("Ошибка валидации:", errorInfo);
      alert("Заполните обязательные поля!");
    }
  };

  // ЭФФЕКТ: Заполнение данных при просмотре
  useEffect(() => {
    if (mode === "show" && initialData) {
      // 1. Обработка Даты
      let dateValue = dayjsLib();
      // Предпочитаем doc_date, если нет - created_at
      const dateString = initialData.doc_date || initialData.created_at;
      if (dateString) {
        dateValue = dayjsLib(dateString);
      }

      // 2. Обработка Получателей (НОВАЯ ЛОГИКА)
      const rawRecipients = initialData.recipients || [];

      // Фильтруем "Кому" (type: 'to') и мапим в формат для UI
      const toRecipients: Recipient[] = rawRecipients
        .filter((r) => r.type === "to")
        .map((r) => ({
          id: r.user.id, // Берем ID юзера, а не записи
          full_name: r.user.full_name,
          photo_path: r.user.photo_path || "", // fallback для null
          position: r.user.position || "",
        }));

      // Фильтруем "Копия" (type: 'copy') - если такие будут
      const ccRecipients: Recipient[] = rawRecipients
        .filter((r) => r.type === "copy")
        .map((r) => ({
          id: r.user.id,
          full_name: r.user.full_name,
          photo_path: r.user.photo_path || "",
          position: r.user.position || "",
        }));

      // 3. Устанавливаем значения в форму
      form.setFieldsValue({
        subject: initialData.subject,
        number: initialData.reg_number, // reg_number из JSON
        date: dateValue,
        // Для формы нужны только ID
        recipients: toRecipients.map((r) => r.id),
        copy: ccRecipients.map((r) => r.id),
      });

      // 4. Обновляем стейт для визуального отображения (чипсы)
      setInitialRecipients(toRecipients);
      setInitialCC(ccRecipients);

      // 5. Контент редактора
      if (initialData.body) {
        setInitialEditorContent(initialData.body);
        setEditorBody(initialData.body);
      }
    }
  }, [mode, initialData, form]);

  return (
    <div
      className={`relative min-h-screen bg-[#f9fafb] ${isOpen ? "max-h-[768px] overflow-hidden" : ""}`}
    >
      <TopNavigation
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <main className="max-w-4xl flex flex-col gap-4 mx-auto px-8 py-12">
        <DocumentHeaderForm
          isDarkMode={isDarkMode}
          form={form}
          initialRecipients={initialRecipients}
          initialCC={initialCC}
        />
        <DocumentEditor
          isDarkMode={isDarkMode}
          mode={currentMode}
          onChange={setEditorBody}
          initialContent={initialEditorContent}
        />
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
