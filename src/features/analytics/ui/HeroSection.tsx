import { Card, Statistic } from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FireOutlined, 
  RiseOutlined 
} from "@ant-design/icons";
import { IAnalyticsHero } from "../model/types";

interface HeroSectionProps {
  data: IAnalyticsHero;
}

export const HeroSection = ({ data }: HeroSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Всего задач"
          value={data.totalTasks}
          prefix={<RiseOutlined className="text-blue-500" />}
          valueStyle={{ fontWeight: "bold" }}
        />
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Процент выполнения"
          value={data.completionRate}
          suffix="%"
          prefix={<CheckCircleOutlined className="text-green-500" />}
          valueStyle={{ fontWeight: "bold", color: data.completionRate > 50 ? "#3f8600" : "#cf1322" }}
        />
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="В огне (Просрочено)"
          value={data.overdueCount}
          prefix={<FireOutlined className="text-red-500" />}
          valueStyle={{ fontWeight: "bold", color: data.overdueCount > 0 ? "#cf1322" : "inherit" }}
        />
      </Card>
      
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Среднее время"
          value={data.averageTime}
          prefix={<ClockCircleOutlined className="text-orange-500" />}
          valueStyle={{ fontWeight: "bold" }}
        />
      </Card>
    </div>
  );
};
