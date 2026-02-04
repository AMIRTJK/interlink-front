import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export const breadcrumbsMap: Record<string, string> = {
  home: "Главная",
  orders: "Заказы",
  statistics: "Статистика",
  "sms-mailing": "Рассылка",
  "document-package": "Пакеты документов",
  settings: "Настройки",
  "by-day": "По дням",
  "by-month": "По месяцам",
  quick_send: "Быстрая отправка СМС",
  schedule: "СМС рассылка",
  "integrated-clients": "Интегрированные клиенты",
  clients_group: "Группа клиентов",
  clients: "Клиенты",
  templates: "Шаблоны сообщений",
  birthday_template: "Шаблон для дней рождений",
  blacklist: "Список запрещённых номеров",
  users: "Пользователи",
  "quick-send": "Быстрая отправка СМС",
  "clients-group": "Группа клиентов",
  "birthday-template": "Шаблон для дней рождений",
  "reference-book": "Справочники",
  organization: "Организация",
  details: "Детализация СМС",
  "details-with-dayt": "Отчёт по дням",
  "details-with-month": "Отчёт  по месяцам",
};

export const getBreadcrumbItems = (pathnames: string[]) => {
  const items = [
    <Breadcrumb.Item key="home">
      <Link to="/" className="flex items-center">
        <HomeOutlined className="text-xl" />
      </Link>
    </Breadcrumb.Item>,
    ...pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
      const nameDecoded = decodeURIComponent(name);

      if (!breadcrumbsMap[nameDecoded]) return;

      return (
        <Breadcrumb.Item key={name}>
          {index === pathnames.length - 1 ? (
            <span className="text-gray-900 font-semibold">
              {breadcrumbsMap[nameDecoded] || nameDecoded}
            </span>
          ) : (
            <Link to={routeTo} className="hover:text-blue-600">
              {breadcrumbsMap[nameDecoded] || nameDecoded}
            </Link>
          )}
        </Breadcrumb.Item>
      );
    }),
  ];

  return items;
};
