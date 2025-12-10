import { useEffect } from "react";
import { Button, DatePicker, Form, Input, TimePicker, message } from "antd";
import { PlusOutlined, CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { TaskFormValues } from "./model";
import "./style.css";

interface AddTaskFormProps {
  initialValues?: Partial<TaskFormValues>;
  onSuccess?: (values: TaskFormValues) => void;
}

export const AddTaskForm = ({ initialValues, onSuccess }: AddTaskFormProps) => {
  const [form] = Form.useForm<TaskFormValues>();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = (values: TaskFormValues) => {
    console.log("Task values:", {
      title: values.title,
      date: values.date?.format("YYYY-MM-DD"),
      time: values.time?.format("HH:mm"),
    });
    message.success("Задача добавлена!");
    
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
            label={<span className="task-form__label">Название задачи</span>}
            rules={[{ required: true, message: "Введите название задачи" }]}
          >
            <Input 
              placeholder="Введите название задачи" 
              prefix={<PlusOutlined style={{ opacity: 0.5 }} />}
            />
          </Form.Item>

          <div className="task-form__row">
            <Form.Item
              name="date"
              label={<span className="task-form__label">Дата</span>}
              rules={[{ required: true, message: "Выберите дату" }]}
            >
              <DatePicker 
                placeholder="Выберите дату" 
                format="DD.MM.YYYY"
                suffixIcon={<CalendarOutlined />}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="time"
              label={<span className="task-form__label">Время</span>}
              rules={[{ required: true, message: "Выберите время" }]}
            >
              <TimePicker 
                placeholder="Выберите время" 
                format="HH:mm"
                suffixIcon={<ClockCircleOutlined />}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

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
