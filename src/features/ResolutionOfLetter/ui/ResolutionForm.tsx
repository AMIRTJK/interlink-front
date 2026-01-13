import { Button, Form, Input, DatePicker, Select, Upload, FormInstance, UploadFile } from "antd";
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import calendarIcon from '../../../assets/icons/calenDar.svg';
import { ResolutionFileList } from "./ResolutionFileList";

interface IProps {
    form: FormInstance;
    onFinish: (values: any) => void;
    onSelectExecutors: () => void;
    onUploadChange: (info: any) => void;
    files: UploadFile[];
    onRemoveFile: (uid: string) => void;
    isPending?: boolean;
}

export const ResolutionForm: React.FC<IProps> = ({ 
    form, 
    onFinish, 
    onSelectExecutors, 
    onUploadChange,
    files,
    onRemoveFile,
    isPending 
}) => {
    return (
        <div className="resolution__form-container">
            <Form form={form} onFinish={onFinish} layout="vertical" className="resolution__form">
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
                        suffixIcon={<img src={calendarIcon} className="resolution__icon" alt="calendar"/>}
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
                    <Button className="resolution__button-executor" onClick={onSelectExecutors}>
                        Выбрать исполнителя
                    </Button>
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

                <ResolutionFileList files={files} onRemove={onRemoveFile} />

                <Button type="primary" htmlType="submit" className="resolution__button" loading={isPending}>
                    Визировать
                </Button>
            </Form>
        </div>
    );
};
