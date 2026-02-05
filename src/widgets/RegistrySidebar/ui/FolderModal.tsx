import { Form, Input, FormInstance } from "antd";
import { motion, AnimatePresence } from "framer-motion";
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-1000"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: 20, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl shadow-indigo-500/20 z-1001 w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-white/60 hover:backdrop-blur-md p-1.5 flex items-center justify-center cursor-pointer group"
              >
                <CloseOutlined className="text-lg transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>
            <Form 
              form={form} 
              onFinish={onFinish} 
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Введите название" }]}
                className="mb-4"
              >
                <Input 
                  placeholder="Введите название папки" 
                  className="w-full! px-4! py-2.5! bg-white/60! backdrop-blur-md! border-white/50! rounded-2xl! focus:ring-2! focus:ring-indigo-400/50! focus:border-transparent! transition-all! shadow-sm! shadow-indigo-100/30! text-sm!"
                />
              </Form.Item>
              <Form.Item
                name="prefix"
                rules={[{ required: false }]}
                className="mb-6"
              >
                <Input 
                  placeholder="Введите префикс папки" 
                  className="w-full! px-4! py-2.5! bg-white/60! backdrop-blur-md! border-white/50! rounded-2xl! focus:ring-2! focus:ring-indigo-400/50! focus:border-transparent! transition-all! shadow-sm! shadow-indigo-100/30! text-sm!"
                />
              </Form.Item>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl text-gray-700 hover:bg-white/80 transition-colors font-medium shadow-sm shadow-indigo-100/30 text-sm cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  onClick={() => form.submit()}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-colors font-medium shadow-lg shadow-indigo-300/40 text-sm cursor-pointer"
                >
                  {isEditing ? "Сохранить" : "Создать"}
                </button>
              </div>
            </Form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
