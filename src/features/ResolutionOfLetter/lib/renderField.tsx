import { Avatar, Button, Form, Input, DatePicker, Select, Upload } from "antd";
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import userAvatar from '../../../assets/images/user-avatar.jpg';
import calendarIcon from '../../../assets/icons/calenDar.svg'
import '../ResolutionOfLetter.css'
interface IProps {
    resolutionerName: string;
    setIsLetterExecutionVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RenderField: React.FC<IProps> = ({ resolutionerName, setIsLetterExecutionVisible }) => {
    console.log(setIsLetterExecutionVisible)
    return (
        <>
            <div className="resolution__content">
                <div className="resolution__author">
                    <Avatar src={userAvatar} size={44} />
                    <div className="resolution__author-info">
                        <p className="resolution__author-name">{resolutionerName}</p>
                        <p className="resolution__author-date">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="resolution__form-container">
                    <Form layout="vertical" className="resolution__form">
                        
                        <Form.Item className="resolution__form-item">
                            <Input placeholder="Виза" className="resolution__input" />
                        </Form.Item>

                        <Form.Item className="resolution__form-item">
                            <DatePicker 
                                placeholder="Срок" 
                                className="resolution__datepicker" 
                                suffixIcon={<img src={calendarIcon} className="resolution__icon" alt="f"/>}
                            />
                        </Form.Item>

                        <Form.Item className="resolution__form-item">
                            <Select 
                                placeholder="Статус" 
                                className="resolution__select py-[16px]! px-[13px]!"
                                suffixIcon={<DownOutlined className="resolution__icon"/>}
                                options={[{ value: 'test', label: 'test' }]}
                            />
                        </Form.Item>

                        <Button className="resolution__button-executor">
                            Выбрать исполнителя
                        </Button>

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
                    </Form>
                </div>
        </div>
        </>
    );
};