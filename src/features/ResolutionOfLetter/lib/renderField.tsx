import { Avatar, Button, Form, Input, DatePicker, Select, Upload, UploadFile } from "antd";
import { DownOutlined, PlusOutlined, FileTextOutlined, DownloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import userAvatar from '../../../assets/images/user-avatar.jpg';
import calendarIcon from '../../../assets/icons/calenDar.svg'
import { SelectExecutorsModal, IDepartment, IUser } from "../ui/SelectExecutorsModal";
import { useState } from "react";
import usersIcon from '../../../assets/icons/users.svg'
import '../ResolutionOfLetter.css'
import { If } from "@shared/ui";

interface IProps {
    resolutionerName: string;
    mutate: (values: {[key:string]:string|number}) => void;
    isPending: boolean;
    isAllowed: boolean;
}

export const RenderField: React.FC<IProps> = ({ resolutionerName, mutate }) => {
    const [form] = Form.useForm();
    const [executorModalOpen, setExecutorModalOpen] = useState(false);
    const [selectedDepts, setSelectedDepts] = useState<IDepartment[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

    const visaValue = Form.useWatch('visa', form);

    const handleExecutorsSelected = (departments: IDepartment[], users: IUser[]) => {
        setSelectedDepts(departments);
        setSelectedUsers(users);
        form.setFieldsValue({
            assignee_departments: departments?.map(d => d.id),
            assignee_users: users?.map(u => u.id)
        });
    };

    const handleRemoveDept = (id: number) => {
        const newDepts = selectedDepts?.filter(d => d.id !== id);
        setSelectedDepts(newDepts);
        form.setFieldValue('assignee_departments', newDepts?.map(d => d.id));
    };

    const handleRemoveUser = (id: number) => {
        const newUsers = selectedUsers?.filter(u => u.id !== id);
        setSelectedUsers(newUsers);
        form.setFieldValue('assignee_users', newUsers.map(u => u.id));
    };

    const handleRemoveFile = (uid: string) => {
        const newFiles = uploadedFiles.filter(f => f.uid !== uid);
        setUploadedFiles(newFiles);
    };

    return (
        <>
            <SelectExecutorsModal 
                open={executorModalOpen} 
                onCancel={() => setExecutorModalOpen(false)}
                onOk={handleExecutorsSelected}
                initialSelectedDepartments={selectedDepts}
                initialSelectedUsers={selectedUsers}
            />
            <div className="resolution__content">
                {/* Левая часть */}
                <div className="resolution__left-content">
                    <div className="resolution__author">
                        <Avatar src={userAvatar} size={44} />
                        <div className="resolution__author-info">
                            <p className="resolution__author-name">{resolutionerName}</p>
                            <p className="resolution__author-date">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <If is={!selectedDepts.length && !selectedUsers.length}>
                        <div className="resolution__form-container">
                            <Form form={form} onFinish={mutate} layout="vertical" className="resolution__form">
                                {/* Hidden fields for executors */}
                                <Form.Item name="assignee_departments" hidden>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="assignee_users" hidden>
                                    <Input />
                                </Form.Item>

                                <Form.Item className="resolution__form-item" name="visa">
                                    <Input placeholder="Виза" className="resolution__input" />
                                </Form.Item>

                                <Form.Item className="resolution__form-item" name="deadline">
                                    <DatePicker 
                                        placeholder="Срок" 
                                        className="resolution__datepicker" 
                                        suffixIcon={<img src={calendarIcon} className="resolution__icon" alt="f"/>}
                                    />
                                </Form.Item>

                                <Form.Item className="resolution__form-item" name="status">
                                    <Select 
                                        placeholder="Статус" 
                                        className="resolution__select py-[16px]! px-[13px]!"
                                        suffixIcon={<DownOutlined className="resolution__icon"/>}
                                        options={[{ value: 'test', label: 'test' }]}
                                    />
                                </Form.Item>

                                <div className="resolution__button-executor-container">
                                    <Button className="resolution__button-executor" onClick={() => setExecutorModalOpen(true)}>
                                        Выбрать исполнителя
                                    </Button>
                                </div>

                                <div className="resolution__upload-section">
                                    <Upload.Dragger 
                                        className="resolution__dragger"
                                        multiple
                                        onChange={(info) => setUploadedFiles(info.fileList)}
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
                                <Button type="primary" htmlType="submit" className="resolution__button">
                                    Визировать
                                </Button>
                            </Form>
                        </div>
                    </If>

                    <If is={selectedDepts.length > 0 || selectedUsers.length > 0}>
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
                                                <div className="resolution__card-pill-close" onClick={() => handleRemoveDept(dept.id)}>
                                                    <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: '12px' }} />
                                                </div>
                                            </div>
                                        ))}
                                        {selectedUsers.map(user => (
                                            <div key={`user-${user.id}`} className="resolution__card-pill">
                                                <Avatar src={userAvatar} className="resolution__card-pill-avatar" />
                                                <span>{user.full_name}</span>
                                                <div className="resolution__card-pill-close" onClick={() => handleRemoveUser(user.id)}>
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
                                    onChange={(info) => setUploadedFiles(info.fileList)}
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

                            {uploadedFiles.length > 0 && (
                                <div className="resolution__files-list">
                                    {uploadedFiles.map((file, i) => (
                                        <div key={file.uid || i} className="resolution__file-card">
                                            <div className="resolution__file-info">
                                                <FileTextOutlined style={{ color: '#003eb3', fontSize: '20px' }} />
                                                <span className="resolution__file-name">{file.name}</span>
                                            </div>
                                            <div className="resolution__file-actions">
                                                <div className="resolution__file-download">
                                                    <DownloadOutlined />
                                                </div>
                                                <div className="resolution__file-remove" onClick={() => handleRemoveFile(file.uid)}>
                                                    <PlusOutlined style={{ transform: 'rotate(45deg)', fontSize: '14px' }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Button type="primary" className="resolution__action-btn" onClick={() => form.submit()}>
                                Визировать
                            </Button>
                        </div>
                    </If>
                </div>

                {/* Правая часть */}
                <If is={!selectedDepts.length && !selectedUsers.length}>
                    <div className="resolution__right-content">
                        <div className="resolution__right-content-action">
                                <img className="resolution__right-content-action-icon" src={usersIcon}/>
                                <h3 className="resolution__right-title">Исполнители не назначены</h3>
                                <p className="resolution__right-text">Выберите исполнителей слева</p>
                                <Button  icon={<PlusOutlined />} type="link" className="resolution__button-executor-right" onClick={() => setExecutorModalOpen(true)}>
                                    Выбрать исполнителя
                                </Button>
                        </div>
                    </div>
                </If>
            </div>
        </>
    );
};