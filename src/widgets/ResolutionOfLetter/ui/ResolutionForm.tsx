import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  FormInstance,
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import { DownOutlined } from "@ant-design/icons";
import { ResolutionFileList } from "./ResolutionFileList";
import { IDepartment, IUser } from "@features/SelectExecutors";
import { IAttachment } from "../model";
import calendarIcon from "../../../assets/icons/calenDar.svg";
import { ExecutorPills } from "./resolutionForm/ExecutorPills";
import { ResolutionUploadZone } from "./resolutionForm/ResolutionUploadZone";

// Свойства формы создания резолюции
interface IProps {
  form: FormInstance; // Экземпляр формы
  onFinish: (values: Record<string, unknown>) => void; // Колбэк при отправке
  onSelectExecutors: () => void; // Открытие выбора исполнителей
  onUploadChange: (info: UploadChangeParam) => void; // Загрузка файлов
  files: IAttachment[]; // Список файлов
  onRemoveFile: (id: number) => void; // Удаление файла
  isPending?: boolean; // Статус загрузки
  isAllowed: boolean; // Права на создание
  selectedDepts: IDepartment[]; // Выбранные отделы
  selectedUsers: IUser[]; // Выбранные пользователи
  mainUserId?: number; // ID главного пользователя
  mainDeptId?: number; // ID главного отдела
  onRemoveUser: (id: number) => void; // Удалить пользователя
  onRemoveDept: (id: number) => void; // Удалить отдел
  onSetMainUser: (id: number) => void; // Назначить пользователя главным
  onSetMainDept: (id: number) => void; // Назначить отдел главным
}

// Компонент формы для создания новой резолюции (визы)
export const ResolutionForm: React.FC<IProps> = ({
  form,
  onFinish,
  onSelectExecutors,
  onUploadChange,
  files,
  onRemoveFile,
  isPending,
  isAllowed,
  selectedDepts,
  selectedUsers,
  mainUserId,
  mainDeptId,
  onRemoveUser,
  onRemoveDept,
  onSetMainUser,
  onSetMainDept,
}) => {
  return (
    <div className="resolution__form-container">
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="resolution__form"
      >
        {/* Скрытые поля для передачи ID в API */}
        <Form.Item name="assignee_departments" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="assignee_users" hidden>
          <Input />
        </Form.Item>

        {/* Поле ввода текста визы */}
        <Form.Item className="resolution__form-item" name="visa">
          <Input placeholder="Виза" className="resolution__input" />
        </Form.Item>

        {/* Выбор срока (дедлайна) */}
        <Form.Item className="resolution__form-item" name="deadline">
          <DatePicker
            placeholder="Срок"
            className="resolution__datepicker"
            suffixIcon={
              <img
                src={calendarIcon}
                className="resolution__icon"
                alt="calendar"
              />
            }
          />
        </Form.Item>

        {/* Выбор статуса резолюции */}
        <Form.Item className="resolution__form-item" name="status">
          <Select
            placeholder="Статус"
            className="resolution__select py-[16px]! px-[13px]!"
            suffixIcon={<DownOutlined className="resolution__icon" />}
            options={[{ value: "test", label: "test" }]}
          />
        </Form.Item>

        {/* Блок управления исполнителями */}
        <div className="resolution__button-executor-container">
          <Button
            className="resolution__button-executor"
            onClick={onSelectExecutors}
          >
            Назначить исполнителей
          </Button>

          <ExecutorPills
            selectedUsers={selectedUsers}
            selectedDepts={selectedDepts}
            mainUserId={mainUserId}
            mainDeptId={mainDeptId}
            onRemoveUser={onRemoveUser}
            onRemoveDept={onRemoveDept}
            onSetMainUser={onSetMainUser}
            onSetMainDept={onSetMainDept}
          />
        </div>

        {/* Зона загрузки файлов */}
        <ResolutionUploadZone
          onUploadChange={onUploadChange}
          isAllowed={isAllowed}
        />

        {/* Список уже загруженных файлов */}
        <ResolutionFileList
          files={files}
          onRemove={onRemoveFile}
          isAllowed={isAllowed}
        />

        {/* Кнопка подтверждения */}
        <Button
          type="primary"
          htmlType="submit"
          className="resolution__button"
          loading={isPending}
        >
          Визировать
        </Button>
      </Form>
    </div>
  );
};
