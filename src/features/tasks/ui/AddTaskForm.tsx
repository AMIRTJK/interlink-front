import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Form } from "antd";
import {
  type ICreateEventPayload,
  type ICreateTaskPayload,
  type ITaskFormValues,
  type IEventResponse,
  colors,
} from "../model";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { RenderFields } from "../lib/renderFields";
import '../style.css'
interface IProps {
  initialValues?: Partial<ITaskFormValues>;
  onSuccess?: (
    values: ICreateTaskPayload | ICreateEventPayload | IEventResponse
  ) => void;
  isEvent?: boolean;
  currentTaskStatus?: string;
  mode?: 'create' | 'edit';
  eventId?: string;
  taskId?: string | number;
}

export const AddTaskForm = ({
  initialValues,
  onSuccess,
  isEvent,
  currentTaskStatus,
  mode = 'create',
  eventId,
  taskId,
}: IProps) => {
  const [form] = Form.useForm<ITaskFormValues>();

  const combinedInitialValues: Partial<ITaskFormValues> = {
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
    method: mode === 'edit' ? 'PUT' : 'POST',
    url: isEvent 
      ? (mode === 'edit' && eventId 
          ? `${ApiRoutes.UPDATE_EVENT}/${eventId}` 
          : ApiRoutes.ADD_EVENT)
      : (mode === 'edit' && taskId
          ? `${ApiRoutes.UPDATE_TASK_STATUS}/${taskId}`
          : ApiRoutes.ADD_TASK),
    messages: {
      success: isEvent 
        ? (mode === 'edit' ? "Событие обновлено!" : "Событие добавлено!") 
        : (mode === 'edit' ? "Задача обновлена!" : "Задача добавлена!"),
      error: isEvent
        ? (mode === 'edit' ? "Ошибка при обновлении события" : "Ошибка при добавлении события")
        : (mode === 'edit' ? "Ошибка при обновлении задачи" : "Ошибка при добавлении задачи"),
      onSuccessCb: (data) => {
        if (isEvent && onSuccess) {
          onSuccess(data as IEventResponse);
        }
      },
      invalidate: [ApiRoutes.GET_TASKS, ApiRoutes.GET_EVENTS],
    },
  });

  const onFinish = (values: ITaskFormValues) => {
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

      const payload: ICreateEventPayload = {
        title: values.title,
        description: values.description || "",
        start_at: startDateTime.format("YYYY-MM-DD HH:mm"),
        end_at: endDateTime.format("YYYY-MM-DD HH:mm"),
        color: String(values.color),
        status: "pending",
        participants: values.assignees || [],
      };

      addTaskMutate(payload);
    } else {
      const payload: ICreateTaskPayload = {
        title: values.title,
        description: values.description || "",
        status: values.status || "pending",
        assignees: values.assignees || [],
      };
      addTaskMutate(payload);
      if (onSuccess) {
        onSuccess(payload);
      }
    }

    if (!isEvent && mode !== 'edit') {
      form.resetFields();
    }
  };

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
      <RenderFields
        isEvent={isEvent}
        isEdit={mode === 'edit'}
        isSelectOpen={isSelectOpen}
        setIsSelectOpen={setIsSelectOpen}
        handleChangeStatusSelectOption={handleChangeStatusSelectOption}
        defaultColor={defaultColor}
        colors={colors}
      />
    </Form>
  );
};
