import { Button, Form, Input, Row, Col, type FormInstance } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { ApiRoutes } from "@shared/api";
import { SelectField } from "@shared/ui";
import { transformSelectResponse } from "./selectExecutorsLib";

interface IProps {
  form: FormInstance;
  activeTab: string;
  open: boolean;
  onSearch: () => void;
}

/** Панель поиска: строка поиска, фильтры по отделу и роли (только для вкладки «Сотрудники»). */
export const ExecutorsSearchBar = ({
  form,
  activeTab,
  open,
  onSearch,
}: IProps) => (
  <div className="select-executors-search bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
    <Form form={form} layout="vertical" onFinish={onSearch}>
      <Row gutter={16} align="bottom">
        <Col span={activeTab === "users" ? 7 : 18}>
          <Form.Item
            name="search"
            label={<span className="text-gray-700 font-bold">Поиск</span>}
            className="mb-0"
          >
            <Input
              placeholder="ФИО или название"
              onPressEnter={onSearch}
              allowClear
            />
          </Form.Item>
        </Col>

        {activeTab === "users" && (
          <>
            <Col span={5}>
              <SelectField
                name="department_id"
                label="Отдел"
                url={ApiRoutes.GET_DEPARTMENTS}
                placeholder="Любой"
                allowClear
                showSearch
                isFetchAllowed={open}
                transformResponse={transformSelectResponse}
                className="mb-0"
                searchParamKey="search"
              />
            </Col>
            <Col span={5}>
              <SelectField
                name="role_id"
                label="Роль"
                url={ApiRoutes.GET_ROLES}
                placeholder="Любая"
                allowClear
                showSearch
                isFetchAllowed={open}
                transformResponse={transformSelectResponse}
                className="mb-0"
                searchParamKey="search"
              />
            </Col>
          </>
        )}

        <Col span={activeTab === "users" ? 7 : 6}>
          <Form.Item label=" " className="mb-0">
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={onSearch}
              block
            >
              Найти
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  </div>
);
