import React from "react";
import { Modal, Form, Input, DatePicker, Select, ConfigProvider, theme } from "antd";
import { useMutationQuery, requiredRule } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { SelectField } from "@shared/ui";
import dayjs from "dayjs";
import type { ICreateAssignmentPayload, AssignmentPriority } from "./types";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string | number;
  isDarkMode?: boolean;
  onSuccess: () => void;
}

export const CreateAssignmentModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  docId,
  isDarkMode,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const { mutate: createAssignment, isPending } = useMutationQuery<ICreateAssignmentPayload>({
    url: ApiRoutes.INTERNAL_ASSIGNMENTS.replace(":id", String(docId)),
    method: "POST",
    messages: {
      success: "Поручение создано",
    },
    queryOptions: {
      onSuccess: () => {
        form.resetFields();
        onSuccess();
        onClose();
      },
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: ICreateAssignmentPayload = {
        executor_user_id: Number(values.executor_user_id),
        text: values.text.trim(),
        due_at: values.due_at ? dayjs(values.due_at).format("YYYY-MM-DD HH:mm:ss") : "",
        priority: values.priority || "medium",
        note: values.note ? values.note.trim() : undefined,
      };

      createAssignment(payload);
    } catch (err) {
      console.error("Ошибка валидации поручения:", err);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        onOk={handleSubmit}
        confirmLoading={isPending}
        title="Создание поручения"
        okText="Создать поручение"
        cancelText="Отмена"
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: "medium",
          }}
          className="mt-3"
        >
          <Form.Item
            name="executor_user_id"
            label="Исполнитель"
            rules={[requiredRule]}
          >
            <SelectField
              name="executor_user_id"
              url={ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS}
              placeholder="Выберите исполнителя"
              allowClear
              showSearch
              transformResponse={(res: any) =>
                (res?.data || res || []).map((u: any) => ({
                  value: u.id,
                  label: u.full_name || `${u.last_name} ${u.first_name}`,
                }))
              }
            />
          </Form.Item>

          <Form.Item
            name="text"
            label="Текст поручения"
            rules={[requiredRule]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Укажите подробное содержание поручения..."
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="due_at"
              label="Срок исполнения"
              rules={[requiredRule]}
            >
              <DatePicker
                showTime
                format="DD.MM.YYYY HH:mm"
                className="w-full"
                placeholder="Выберите дату"
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="Приоритет"
              rules={[requiredRule]}
            >
              <Select
                options={[
                  { value: "low", label: "Низкий" },
                  { value: "medium", label: "Средний" },
                  { value: "high", label: "Высокий" },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item name="note" label="Примечание (необязательно)">
            <Input.TextArea
              rows={2}
              placeholder="Дополнительные детали или примечания..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};
