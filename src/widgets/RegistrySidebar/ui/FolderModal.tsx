import { Modal, Form, Input, FormInstance } from "antd";

interface IProps {
  isOpen: boolean;
  isEditing: boolean;
  parentId: number | null;
  form: FormInstance;
  onCancel: () => void;
  onFinish: (values: { name: string }) => void;
}

export const FolderModal = ({
  isOpen,
  isEditing,
  parentId,
  form,
  onCancel,
  onFinish,
}: IProps) => {
  const getTitle = () => {
    if (isEditing) return "Редактировать папку";
    if (parentId) return "Создать подпапку";
    return "Создать папку";
  };

  return (
    <Modal
      title={getTitle()}
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText={isEditing ? "Редактировать" : "Создать"}
      cancelText="Отмена"
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="name"
          label="Название папки"
          rules={[{ required: true, message: "Введите название" }]}
        >
          <Input placeholder="Введите название..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
