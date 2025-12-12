import { useEffect } from "react";
import { Button, Form, Input, Select } from "antd";
import type { CreateTaskPayload, TaskFormValues } from "./model";
import { TASK_STATUS_OPTIONS } from "./model";
import "./style.css";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { SelectField } from "@shared/ui";
import { transformAssigneesResponse } from "./lib";

interface AddTaskFormProps {
  initialValues?: Partial<TaskFormValues>;
  onSuccess?: (values: CreateTaskPayload) => void;
}

export const AddTaskForm = ({ initialValues, onSuccess }: AddTaskFormProps) => {
  const [form] = Form.useForm<CreateTaskPayload>();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const { mutate: addTaskMutate } = useMutationQuery({
    method: "POST",
    url: ApiRoutes.ADD_TASK,
    messages: {
      success: "Задача добавлена!",
      error: "Ошибка при добавлении задачи",
      invalidate: [ApiRoutes.GET_TASKS],
    },
  });

  const onFinish = (values: CreateTaskPayload) => {
    console.log("Task values:", {
      title: values.title,
      description: values?.description,
      status: "pending",
      assignees: [values?.assignees],
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
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Введите название задачи" }]}
          >
            <Input placeholder="Введите название задачи" />
          </Form.Item>
          <Form.Item
            name="description"
            rules={[{ required: true, message: "Введите описание задачи" }]}
          >
            <Input.TextArea
              placeholder="Введите описание задачи"
              style={{ resize: "none" }}
            />
          </Form.Item>
          <SelectField
            onChange={(values) => {
              // values — массив id выбранных пользователей
              console.log("Selected assignees:", values);
            }}
            label={false}
            name="assignees"
            placeholder="Выберите исполнителей"
            showSearch
            allowClear
            mode="multiple"
            url={ApiRoutes.GET_ASSIGNEES}
            method="GET"
            transformResponse={transformAssigneesResponse}
            searchParamKey="full_name"
            className="mb-0!"
          />
          <Form.Item
            name="status"
            rules={[{ required: true, message: "Выберите статус задачи" }]}
          >
            <Select
              placeholder="Выберите статус задачи"
              style={{ width: "100%" }}
              options={TASK_STATUS_OPTIONS}
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
