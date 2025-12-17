import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button, DatePicker, Form, Select, TimePicker } from "antd";
import type {
  CreateEventPayload,
  CreateTaskPayload,
  TaskFormValues,
  EventResponse,
} from "./model";
import { TASK_STATUS_OPTIONS } from "./model";
import "./style.css";
import { requiredRule, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If, SelectField, TextField } from "@shared/ui";
import { transformAssigneesResponse } from "./lib";
import ArrowBottomSuffix from "../../assets/icons/arrow-bottom-suffix.svg";
import DescriptionIcon from "../../assets/icons/description-icon.svg";

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
      onSuccessCb: (data) => {
        if (isEvent && onSuccess) {
          onSuccess(data as EventResponse);
        }
      },
      invalidate: [ApiRoutes.GET_TASKS],
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
        color: String(values.color),
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

  const colors = [
    { name: "Желтый", value: "#FFCB33" },
    { name: "Зеленный", value: "#29CC39" },
    { name: "Оранжевый", value: "#FF6633" },
    { name: "Бронзовый", value: "#CC7429" },
    { name: "Пурпурный", value: "#8833FF" },
    { name: "Бирюзово-синий", value: "#33BFFF" },
    { name: "Розовый", value: "#E62E7B" },
    { name: "Тиффани", value: "#2EE6CA" },
  ];

  const defaultColor = colors[0]?.value;

  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);

  const handleChangeStatusSelectOption = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    setIsSelectOpen(true);
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      initialValues={combinedInitialValues}
    >
      <div className="flex items-center w-full px-6 gap-2 mb-6">
        <TextField
          label=""
          name="title"
          placeholder={isEvent ? "Название мероприятия" : "Название задачи"}
          rules={[requiredRule]}
          customClass="task-form-field flex-1"
          className="border-none! h-10 w-full!"
        />

        <If is={isEvent}>
          <div
            onClick={handleChangeStatusSelectOption}
            className="flex items-center px-2 shadow-[0_0_20px_rgba(38,51,77,0.08)] h-10 rounded-[30px] w-[100px] bg-white cursor-pointer"
          >
            <Form.Item name="color" noStyle initialValue={defaultColor}>
              <Select
                open={isSelectOpen}
                onDropdownVisibleChange={(visible) => setIsSelectOpen(visible)}
                variant="borderless"
                style={{ width: "100%" }}
                dropdownStyle={{ minWidth: 200 }}
                suffixIcon={<img src={ArrowBottomSuffix} />}
                labelRender={(props) => (
                  <div className="flex items-center h-full">
                    <div
                      style={{
                        backgroundColor: String(props.value),
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                )}
              >
                {colors.map((e, index) => (
                  <Select.Option key={index} value={e.value} label={e.value}>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          backgroundColor: e.value,
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                        }}
                      />
                      <span>{e.name}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </If>
      </div>
      <div className="flex items-center w-full px-6 gap-2 mb-6">
        <TextField
          prefix={<img src={DescriptionIcon} style={{ marginRight: "15px" }} />}
          name="description"
          placeholder="Описание"
          rules={[requiredRule]}
          customClass="task-form-field flex-1"
          className="border-none! h-10 w-full!"
        />
      </div>
      <If is={isEvent}>
        <div className="flex items-center w-full px-6 gap-2">
          <Form.Item name="date" style={{ flex: 1 }}>
            <DatePicker
              placeholder="Выберите дату"
              format="DD.MM.YYYY"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="time" style={{ flex: 1 }}>
            <TimePicker
              placeholder="Выберите время"
              format="HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>
      </If>
      <If is={isEvent}>
        <div className="flex items-center w-full px-6 gap-2">
          <Form.Item name="endTime" style={{ flex: 1 }}>
            <TimePicker
              placeholder="Время окончания"
              format="HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>
      </If>
      <div className="flex items-center w-full px-6 gap-2">
        <SelectField
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
          className="mb-5! flex-1"
        />
      </div>
      <If is={!isEvent}>
        <div className="flex items-center w-full px-6 gap-2">
          <Form.Item
            name="status"
            rules={[{ required: true, message: "Выберите статус задачи" }]}
            style={{ flex: 1 }}
          >
            <Select
              placeholder="Выберите статус задачи"
              style={{ width: "100%" }}
              options={TASK_STATUS_OPTIONS}
            />
          </Form.Item>
        </div>
      </If>
      <div className="flex items-center w-full px-6 gap-2">
        <Button
          type="primary"
          htmlType="submit"
          className="bg-[#0037af]!"
          block
        >
          {isEvent ? "Добавить событие" : "Добавить задачу"}
        </Button>
      </div>
    </Form>
  );
};
