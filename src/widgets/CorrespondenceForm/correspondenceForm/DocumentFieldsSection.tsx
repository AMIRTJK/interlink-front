import { Form, Input, Col, Row } from "antd";
import { DateField, If, SelectField } from "@shared/ui";
import { ApiRoutes } from "@shared/api";
import { transformResponse } from "../lib";

interface IProps {
  isIncoming: boolean;
  isOutgoing: boolean;
  labelStyle: string;
  inputStyle: string;
}

export const DocumentFieldsSection = ({
  isIncoming,
  isOutgoing,
  labelStyle,
  inputStyle,
}: IProps) => (
  <div>
    <h2 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-100 pb-2">
      Данные документа
    </h2>

    <Row gutter={[24, 20]}>
      <Col span={8}>
        <If is={isIncoming}>
          <SelectField
            label={<span className={labelStyle}>Отправитель</span>}
            name="sender_name"
            url={ApiRoutes.GET_ORGANIZATIONS}
            placeholder="Выберите отправителя"
            showSearch
            allowClear
            method="GET"
            transformResponse={(data) => transformResponse(data)}
            searchParamKey="search"
            selectClass={inputStyle}
          />
        </If>
        <If is={isOutgoing}>
          <Form.Item
            label={<span className={labelStyle}>Получатель</span>}
            name="recipient"
          >
            <Input placeholder="Получатель" className={inputStyle} />
          </Form.Item>
        </If>
      </Col>

      <Col span={8}>
        <DateField
          className={`w-full ${inputStyle}`}
          name="doc_date"
          label={<span className={labelStyle}>Дата регистрации</span>}
          placeholder="Выберите дату"
        />
      </Col>

      <Col span={8}>
        <DateField
          className={`w-full ${inputStyle}`}
          name="sentDate"
          label={<span className={labelStyle}>Дата отправления</span>}
          placeholder="Выберите дату"
        />
      </Col>

      <Col span={8}>
        <Form.Item
          label={<span className={labelStyle}>Тема письма</span>}
          name="subject"
        >
          <Input placeholder="Тема письма" className={inputStyle} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label={<span className={labelStyle}>Почта</span>}
          name="email"
        >
          <Input placeholder="Введите почту" className={inputStyle} />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label={<span className={labelStyle}>Входящий номер</span>}
          name="incomingNumber"
        >
          <Input
            placeholder="Введите входящий номер"
            className={inputStyle}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <Form.Item
          label={<span className={labelStyle}>Контакт</span>}
          name="sender_contact"
        >
          <Input
            placeholder="Введите номер телефона"
            className={inputStyle}
          />
        </Form.Item>
      </Col>

      <Col span={8}>
        <SelectField
          label={<span className={labelStyle}>Папка</span>}
          name="folder"
          url={ApiRoutes.CORRESPONDENCE_FOLDERS}
          placeholder="Выберите папку"
          method="GET"
          transformResponse={(data) => transformResponse(data)}
          searchParamKey="name"
          showSearch
          allowClear
          selectClass={inputStyle}
        />
      </Col>

      <Col span={8}>
        <Form.Item
          label={<span className={labelStyle}>Исходящий номер</span>}
          name="outgoingNumber"
        >
          <Input
            placeholder="Введите исходящий номер"
            className={inputStyle}
          />
        </Form.Item>
      </Col>
    </Row>
  </div>
);
