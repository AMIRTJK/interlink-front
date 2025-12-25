import { SelectField } from "@shared/ui";
import { Form, Input, DatePicker, Button } from "antd";

export const renderFields = () => {
    return (
        <div className="details__fields-wrapper">
            <Form.Item name="folder" rules={[{ required: true }]} className="details__letter-field">
                <SelectField url="api/folders" method="GET" name="folder" placeholder="Выбрать папку *" />
            </Form.Item>
            <Form.Item name="sender" rules={[{ required: true }]} className="details__letter-field">
                <SelectField url="api/senders" method="GET" name="sender" placeholder="Отправитель *" />
            </Form.Item>
            <Form.Item name="incomingNumber" rules={[{ required: true }]} className="details__letter-field">
                <Input placeholder="Входящий номер *" />
            </Form.Item>
            
            <Form.Item name="receivingDate" rules={[{ required: true }]} className="details__letter-field">
                <DatePicker placeholder="Дата получения *" format="DD.MM.YYYY" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="outgoingNumber" rules={[{ required: true }]} className="details__letter-field">
                <Input placeholder="Исходящий номер *" />
            </Form.Item>
            <div className="details__letter-field">
                <Button
                    type="default"
                    className="details__letter-button"
                >
                    ОТПРАВИТЕЛЬ
                </Button>
            </div>

            <Form.Item name="contact" className="details__letter-field">
                <Input placeholder="Контакт" />
            </Form.Item>
            <Form.Item name="subject" className="details__letter-field">
                <Input placeholder="Тема" />
            </Form.Item>
        </div>
    );
};






    
