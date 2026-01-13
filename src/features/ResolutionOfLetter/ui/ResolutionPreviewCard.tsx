import { Avatar, Button, Upload,} from "antd";
import userAvatar from '../../../assets/images/user-avatar.jpg';
import { IDepartment, IUser } from "../ui/SelectExecutorsModal";
import { PlusOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

interface IProps {
    resolutionerName: string;
    selectedDepts: IDepartment[];
    selectedUsers: IUser[];
    visaValue: string;
    onRemoveDept: (id: number) => void;
    onRemoveUser: (id: number) => void;
    onUploadChange: (info: any) => void;
    onSubmit: () => void;
    isPending?: boolean;
}

export const ResolutionPreviewCard: React.FC<IProps> = ({
    resolutionerName,
    selectedDepts,
    selectedUsers,
    visaValue,
    onRemoveDept,
    onRemoveUser,
    onUploadChange,
    onSubmit,
    isPending
}) => {
    return (
        <div className="resolution__preview-container">
            <div className="resolution__card">
                <div className="resolution__card-signed-banner">
                    <SafetyCertificateOutlined />
                    <span>Подписано электронной подписью</span>
                </div>

                <div className="resolution__card-section">
                    <span className="resolution__card-label">Исполнители</span>
                    <div className="resolution__card-executors">
                        {selectedDepts.map(dept => (
                            <div key={`dept-${dept.id}`} className="resolution__card-pill">
                                <Avatar icon={<PlusOutlined />} className="resolution__card-pill-avatar" style={{ backgroundColor: '#87d068' }} />
                                <span>{dept.name}</span>
                                <div className="resolution__card-pill-close" onClick={() => onRemoveDept(dept.id)}>
                                    <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: '12px' }} />
                                </div>
                            </div>
                        ))}
                        {selectedUsers.map(user => (
                            <div key={`user-${user.id}`} className="resolution__card-pill">
                                <Avatar src={userAvatar} className="resolution__card-pill-avatar" />
                                <span>{user.full_name}</span>
                                <div className="resolution__card-pill-close" onClick={() => onRemoveUser(user.id)}>
                                    <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: '12px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="resolution__card-divider" />

                <div className="resolution__card-section">
                    <span className="resolution__card-label">Основание:</span>
                    <span className="resolution__card-value">{visaValue || "—"}</span>
                </div>

                <div className="resolution__card-divider" />

                <div className="resolution__card-section">
                    <span className="resolution__card-label">Электронная подпись</span>
                    <div className="resolution__signature-details">
                        <span className="resolution__card-value">{resolutionerName}</span>
                        <div className="resolution__signature-row">
                            <span className="resolution__signature-label">Дата и время:</span>
                            <span className="resolution__signature-value--blue">
                                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="resolution__signature-row">
                            <span className="resolution__signature-label">Сертификат:</span>
                            <span className="resolution__signature-value--green">Действителен</span>
                        </div>
                        <Button className="resolution__signature-btn" ghost>
                            Подробнее о подписи
                        </Button>
                    </div>
                </div>
            </div>

            <div className="resolution__upload-section">
                <Upload.Dragger 
                    className="resolution__dragger"
                    multiple
                    onChange={onUploadChange}
                    beforeUpload={() => false}
                    showUploadList={false}
                >
                    <p className="resolution__upload-title">Загрузить файлы</p>
                    <div className="resolution__dragger-content">
                        <div className="resolution__dragger-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                        </div>
                        <p className="resolution__dragger-text">
                            Просмотрите и выберите файлы, которые хотите загрузить с вашего компьютера.
                        </p>
                        <div className="resolution__dragger-plus">
                            <PlusOutlined style={{ color: 'white', fontSize: '16px' }} />
                        </div>
                    </div>
                </Upload.Dragger>
            </div>

            <Button type="primary" className="resolution__action-btn" onClick={onSubmit} loading={isPending}>
                Визировать
            </Button>
        </div>
    );
};
