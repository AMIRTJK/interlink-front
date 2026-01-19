import {
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  FormInstance,
  Avatar,
} from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import {
  DownOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  CrownFilled,
  CloseOutlined,
} from "@ant-design/icons";
import { ResolutionFileList } from "./ResolutionFileList";
import { IDepartment, IUser } from "@features/SelectExecutors";
import { IAttachment } from "../model";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import calendarIcon from "../../../assets/icons/calenDar.svg";

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

          {/* Список визуальных капсул (pills) выбранных исполнителей */}
          <div className="flex flex-col gap-2">
            {/* Выбранные пользователи */}
            {selectedUsers.map((user) => {
              const isMain = mainUserId === user.id;
              return (
                <div
                  key={user.id}
                  className={`resolution__form-pill ${isMain ? "resolution__form-pill--main" : ""}`}
                >
                  <div className="resolution__form-pill-info flex-1">
                    <Avatar
                      src={userAvatar}
                      icon={<UserOutlined />}
                      size="small"
                    />
                    <span className="resolution__form-pill-name">
                      {user.full_name}
                    </span>
                  </div>
                  <div className="resolution__form-pill-actions">
                    {/* Кнопка выбора главного */}
                    <Button
                      type="text"
                      className="resolution__form-pill-btn"
                      icon={
                        <CrownFilled
                          style={{
                            fontSize: "12px",
                            color: isMain ? "#1a1a1a" : "#94a3b8",
                          }}
                        />
                      }
                      onClick={() => onSetMainUser(user.id)}
                    />

                    {/* Кнопка удаления */}
                    <Button
                      type="text"
                      className="resolution__form-pill-btn danger"
                      icon={<CloseOutlined style={{ fontSize: "12px" }} />}
                      onClick={() => onRemoveUser(user.id)}
                    />
                  </div>
                </div>
              );
            })}

            {/* Выбранные отделы */}
            {selectedDepts.map((dept) => {
              const isMain = mainDeptId === dept.id;
              return (
                <div
                  key={dept.id}
                  className={`resolution__form-pill ${isMain ? "resolution__form-pill--main" : ""}`}
                >
                  <div className="resolution__form-pill-info flex-1">
                    <Avatar
                      icon={<TeamOutlined />}
                      size="small"
                      className={isMain ? "bg-white/30" : "bg-blue-100"}
                    />
                    <span className="resolution__form-pill-name">
                      {dept.name}
                    </span>
                  </div>
                  <div className="resolution__form-pill-actions">
                    <Button
                      type="text"
                      className="resolution__form-pill-btn"
                      icon={
                        <CrownFilled
                          style={{
                            fontSize: "12px",
                            color: isMain ? "#1a1a1a" : "#94a3b8",
                          }}
                        />
                      }
                      onClick={() => onSetMainDept(dept.id)}
                    />

                    <Button
                      type="text"
                      className="resolution__form-pill-btn danger"
                      icon={<CloseOutlined style={{ fontSize: "12px" }} />}
                      onClick={() => onRemoveDept(dept.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Зона загрузки файлов */}
        <div className="resolution__upload-section bg-[white]!">
          <Upload.Dragger
            className="resolution__dragger"
            multiple
            onChange={onUploadChange}
            beforeUpload={() => false}
            showUploadList={false}
            disabled={!isAllowed}
          >
            <p className="resolution__upload-title">Загрузить файлы</p>
            <div className="resolution__dragger-content">
              <div className="resolution__dragger-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <p className="resolution__dragger-text">
                Перетащите файлы сюда или нажмите для выбора
              </p>
              <div className="resolution__dragger-plus">
                <PlusOutlined style={{ color: "white", fontSize: "16px" }} />
              </div>
            </div>
          </Upload.Dragger>
        </div>

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
