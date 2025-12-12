import { useEffect } from "react";
import { Button, Form, Input,   } from "antd";
import { PlusOutlined,} from "@ant-design/icons";
import type { CreateTaskPayload,  } from "./model";
import "./style.css";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

interface AddTaskFormProps {
  initialValues?: Partial<CreateTaskPayload>;
  onSuccess?: (values: CreateTaskPayload) => void;
}

export const AddTaskForm = ({ initialValues, onSuccess }: AddTaskFormProps) => {
  const [form] = Form.useForm<CreateTaskPayload>();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);
  const {mutate:addTaskMutate}=useMutationQuery({
    method:"POST",
    url:ApiRoutes.ADD_TASK,
    messages:{
      success:"Задача добавлена!",
      error:"Ошибка при добавлении задачи",
      invalidate:[ApiRoutes.GET_TASKS]
    }
  })

  const onFinish = (values: CreateTaskPayload) => {
    console.log("Task values:", {
      title: values.title,
      description: values?.description,
      status: 'pending',
      assignees: [values?.assignees]
    });
    addTaskMutate(values);
    
    if (onSuccess) {
      onSuccess(values);
    }
    
    form.resetFields();
  };

  return (
    <div className="task-form">
      <h2 className="task-form__title">Добавить задачу</h2>
      <div className="task-form__container">
        <Form
          form={form}
          name="addTask"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Введите название задачи" }]}
          >
            <Input 
              placeholder="Введите название задачи" 
            />
          </Form.Item>
          <Form.Item
            name="description"
            rules={[{ required: true, message: "Введите описание задачи" }]}
          >
            <Input.TextArea 
              placeholder="Введите описание задачи" 
              style={{resize:"none"}}
            />  
          </Form.Item>
          <Form.Item className="task-form__submit">
            <Button type="primary" htmlType="submit" block>
              Добавить задачу
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
