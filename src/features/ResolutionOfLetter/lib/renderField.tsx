import { Avatar, Button, Form, Input, DatePicker, Select, Upload, Tag } from "antd";
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import userAvatar from '../../../assets/images/user-avatar.jpg';
import calendarIcon from '../../../assets/icons/calenDar.svg'
import { SelectExecutorsModal, IDepartment, IUser } from "../ui/SelectExecutorsModal";
import { useState } from "react";
import '../ResolutionOfLetter.css'

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

    const handleExecutorsSelected = (departments: IDepartment[], users: IUser[]) => {
        setSelectedDepts(departments);
        setSelectedUsers(users);
        
        // Update form values for submission
        form.setFieldsValue({
            assignee_departments: departments.map(d => d.id),
            assignee_users: users.map(u => u.id)
        });
    };

    const handleRemoveDept = (id: number) => {
        const newDepts = selectedDepts.filter(d => d.id !== id);
        setSelectedDepts(newDepts);
        form.setFieldValue('assignee_departments', newDepts.map(d => d.id));
    };

    const handleRemoveUser = (id: number) => {
        const newUsers = selectedUsers.filter(u => u.id !== id);
        setSelectedUsers(newUsers);
        form.setFieldValue('assignee_users', newUsers.map(u => u.id));
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
                <div className="resolution__author">
                    <Avatar src={userAvatar} size={44} />
                    <div className="resolution__author-info">
                        <p className="resolution__author-name">{resolutionerName}</p>
                        <p className="resolution__author-date">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
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

                        <div style={{ marginBottom: 32 }}>
                            <Button className="resolution__button-executor" onClick={() => setExecutorModalOpen(true)}>
                                Выбрать исполнителя
                            </Button>
                            
                            {/* Display chosen executors */}
                            {(selectedDepts.length > 0 || selectedUsers.length > 0) && (
                                <div className="resolution__selected-tags-container">
                                    {selectedDepts.map(dept => (
                                        <Tag 
                                            key={dept.id} 
                                            closable 
                                            onClose={() => handleRemoveDept(dept.id)}
                                            className="resolution__selected-tag"
                                            color="blue"
                                        >
                                            <span>{dept.name}</span>
                                        </Tag>
                                    ))}
                                    {selectedUsers.map(user => (
                                        <Tag 
                                            key={user.id} 
                                            closable 
                                            onClose={() => handleRemoveUser(user.id)}
                                            className="resolution__selected-tag"
                                            color="cyan"
                                        >
                                            <span>{user.full_name}</span>
                                        </Tag>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="resolution__upload-section">
                            <Upload.Dragger className="resolution__dragger">
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
        </div>
        </>
    );
};