import { Card, Statistic, Row, Col } from "antd";
import { RiseOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

export const Analytics = () => {
  return (
    <div className="profile-page">
      <div className="analytics-container">
        <h2 className="page-title">Аналитика</h2>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card className="analytics-card">
              <Statistic
                title="Всего задач"
                value={24}
                prefix={<RiseOutlined />}
                valueStyle={{ color: "#667eea" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="analytics-card">
              <Statistic
                title="Выполнено"
                value={18}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="analytics-card">
              <Statistic
                title="В ожидании"
                value={6}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};
