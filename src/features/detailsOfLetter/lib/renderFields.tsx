import { SelectField } from "@shared/ui";
import { Form, Input, DatePicker, Button } from "antd";

interface IProps{
  createLetterIsPending?: boolean;
  isAllowed?: boolean;
}
export const renderFields = ({createLetterIsPending, isAllowed}: IProps)=> (
  <div className="details__fields-wrapper bg-white rounded-2xl p-8">
    <Form.Item name="folder" className="details__letter-field">
      <SelectField url="api/folders" method="GET" name="folder" placeholder="Выбрать папку" />
    </Form.Item>

    <Form.Item name="sender" className="details__letter-field">
      <SelectField url="api/senders" method="GET" name="sender" placeholder="Отправитель" />
    </Form.Item>

    <Form.Item name="incomingNumber" className="details__letter-field">
      <Input placeholder="Входящий номер" />
    </Form.Item>

    <Form.Item name="receivingDate" className="details__letter-field">
      <DatePicker placeholder="Дата получения" format="DD.MM.YYYY" className="w-full" />
    </Form.Item>

    <Form.Item name="outgoingNumber" className="details__letter-field">
      <Input placeholder="Исходящий номер" />
    </Form.Item>

    <div className="details__letter-field">
      <Button type="default" className="details__letter-button">
        ОТПРАВИТЕЛЬ
      </Button>
    </div>

    <Form.Item name="contact" className="details__letter-field">
      <Input placeholder="Контакт" />
    </Form.Item>

    <Form.Item name="subject" className="details__letter-field">
      <Input placeholder="Тема" />
    </Form.Item>

    <Button loading={createLetterIsPending} disabled={createLetterIsPending || !isAllowed } htmlType="submit">
      Создать
    </Button>
  </div>
);