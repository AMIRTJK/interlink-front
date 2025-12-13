import { useEffect } from "react";
import dayjs from "dayjs";
import {
  Button,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  Select,
  TimePicker,
} from "antd";
import type {
  CreateEventPayload,
  CreateTaskPayload,
  TaskFormValues,
  EventResponse,
} from "./model";
import { TASK_STATUS_OPTIONS } from "./model";
import "./style.css";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { SelectField } from "@shared/ui";
import { transformAssigneesResponse } from "./lib";

interface IProps {
  initialValues?: Partial<TaskFormValues>;
  onSuccess?: (
    values: CreateTaskPayload | CreateEventPayload | EventResponse
  ) => void;
  isEvent?: boolean;
  currentTaskStatus?: string;
}

export const AddTaskForm = ({
  initialValues,
  onSuccess,
  isEvent,
  currentTaskStatus,
}: IProps) => {
  const [form] = Form.useForm<TaskFormValues>();

  // Определяем объединенные начальные значения
  const combinedInitialValues: Partial<TaskFormValues> = {
    ...initialValues,
    status:
      !isEvent && currentTaskStatus ? currentTaskStatus : initialValues?.status,
  };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const { mutate: addTaskMutate } = useMutationQuery({
    method: "POST",
    url: isEvent ? ApiRoutes.ADD_EVENT : ApiRoutes.ADD_TASK,
    messages: {
      success: isEvent ? "Событие добавлено!" : "Задача добавлена!",
      error: isEvent
        ? "Ошибка при добавлении события"
        : "Ошибка при добавлении задачи",
      invalidate: [ApiRoutes.GET_TASKS],
      onSuccessCb: (data) => {
        if (isEvent && onSuccess) {
          onSuccess(data as EventResponse);
        }
      },
    },
  });

  const onFinish = (values: TaskFormValues) => {
    if (isEvent) {
      const dateStr = values.date?.format("YYYY-MM-DD");
      const timeStr = values.time?.format("HH:mm");
      const startDateTime = dayjs(`${dateStr} ${timeStr}`);

      let endDateTime;
      if (values.endTime) {
        const endTimeStr = values.endTime.format("HH:mm");
        endDateTime = dayjs(`${dateStr} ${endTimeStr}`);
        if (
          endDateTime.isBefore(startDateTime) ||
          endDateTime.isSame(startDateTime)
        ) {
          endDateTime = endDateTime.add(1, "day");
        }
      } else {
        endDateTime = startDateTime.add(1, "hour");
      }

      const payload: CreateEventPayload = {
        title: values.title,
        description: values.description || "",
        start_at: startDateTime.format("YYYY-MM-DD HH:mm"),
        end_at: endDateTime.format("YYYY-MM-DD HH:mm"),
        color:
          typeof values.color === "string"
            ? values.color
            : values.color &&
                typeof values.color === "object" &&
                "toHexString" in values.color
              ? (values.color as { toHexString: () => string }).toHexString()
              : "#3b82f6",
        status: "pending",
        participants: values.assignees || [],
      };

      console.log("Event payload:", payload);
      addTaskMutate(payload);
    } else {
      const payload: CreateTaskPayload = {
        title: values.title,
        description: values.description || "",
        status: values.status || "pending",
        assignees: values.assignees || [],
      };

      console.log("Task values:", payload);
      addTaskMutate(payload);
      if (onSuccess) {
        onSuccess(payload);
      }
    }

    if (!isEvent) {
      form.resetFields();
    }
  };

  return (
    <div className="task-form__container">
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={combinedInitialValues}
      >
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
        {isEvent && (
          <div style={{ display: "flex", gap: "10px" }}>
            <Form.Item
              name="date"
              style={{ flex: 1 }}
            >
              <DatePicker placeholder="Выберите дату" format="DD.MM.YYYY" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="time"
              style={{ flex: 1 }}
            >
              <TimePicker placeholder="Выберите время" format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </div>
        )}
        {isEvent && (
          <div style={{ display: "flex", gap: "10px" }}>
            <Form.Item
              name="endTime"
              style={{ flex: 1 }}
            >
              <TimePicker placeholder="Время окончания" format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="color"  initialValue="#3b82f6">
              <ColorPicker />
            </Form.Item>
          </div>
        )}
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
          className="mb-5!"
        />
        {!isEvent && (
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
        )}
        <Form.Item className="task-form__submit">
          <Button type="primary" htmlType="submit" block>
            {isEvent ? "Добавить событие" : "Добавить задачу"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
