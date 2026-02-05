import { Modal, Form, Input, FormInstance, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

interface IProps {
  isOpen: boolean;
  isEditing: boolean;
  parentId: number | null;
  form: FormInstance;
  onCancel: () => void;
  onFinish: (values: { name: string; prefix?: string }) => void;
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
    if (parentId) return "Создать папку";
    return "Создать папку";
  };

  return (
    <Modal
      title={<span className="text-[19px] font-semibold text-[#2d3748]">{getTitle()}</span>}
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      centered
      closeIcon={
        <span className="text-gray-400 hover:text-gray-500 transition-colors">
          <CloseOutlined className="text-base" />
        </span>
      }
      styles={{
        mask: {
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
        },
        body: {
          padding: 0
        }
      }}
      width={380}
    >
      <Form 
        form={form} 
        onFinish={onFinish} 
        layout="vertical"
        autoComplete="off"
        className="pt-6"
      >
        <Form.Item
          name="name"
          label={<span className="text-[13px] font-medium text-[#1a202c]">Название папки</span>}
          rules={[{ required: true, message: "Введите название" }]}
          className="mb-5"
        >
          <Input 
            placeholder="Введите название" 
            className="h-[46px]! px-4! text-[15px]! bg-white! border border-gray-200! rounded-[22px]! placeholder:text-gray-400! focus:border-indigo-400! focus:ring-1! focus:ring-indigo-200! transition-all!"
          />
        </Form.Item>
        
        <Form.Item
          name="prefix"
          label={<span className="text-[13px] font-medium text-[#1a202c]">№ папки</span>}
          rules={[{ required: false }]}
          className="mb-8"
        >
          <Input 
            placeholder="Введите номер" 
            className="h-[46px]! px-4! text-[15px]! bg-white! border border-gray-200! rounded-[22px]! placeholder:text-gray-400! focus:border-indigo-400! focus:ring-1! focus:ring-indigo-200! transition-all!"
          />
        </Form.Item>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onCancel}
            className="flex-1! h-[50px]! text-[15px]! font-semibold! bg-white! border border-gray-200! text-[#4a5568]! rounded-[25px]! hover:bg-gray-50! transition-all! shadow-sm!"
          >
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => form.submit()}
            className="flex-1! h-[50px]! text-[15px]! font-semibold! bg-linear-to-r! from-[#7c3aed]! to-[#a855f7]! border-none! text-white! rounded-[25px]! hover:opacity-95! transition-all! shadow-lg! shadow-purple-400/40!"
          >
            {isEditing ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
