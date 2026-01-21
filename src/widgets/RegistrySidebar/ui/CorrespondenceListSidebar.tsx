import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { Loader } from "@shared/ui";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { useMemo } from "react";

// Функция для стилизации статусов (обновил под ваши статусы из JSON)
const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s === "draft") return "bg-gray-200 text-gray-600";
  if (s === "to_register") return "bg-blue-100 text-blue-600";
  if (s === "to_execute") return "bg-[#FFA825] text-white"; // Оранжевый
  if (s === "registered") return "bg-[#7B54C4] text-white"; // Фиолетовый
  return "bg-gray-100 text-gray-500";
};

// Функция для красивого отображения названия статуса
const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    draft: "Черновик",
    to_register: "На регистрацию",
    to_execute: "На исполнении",
    executed: "Исполнено",
    registered: "Зарегистрировано",
  };
  return map[status] || status;
};

export const CorrespondenceListSidebar = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useGetQuery({
    url: ApiRoutes.GET_CORRESPONDENCES,
    params: {
      kind: "incoming",
      page: 1,
      limit: 20,
    },
  });

  const list = useMemo(() => {
    // Получаем тело ответа (обычно это data.data в axios)
    const responseBody = (data as any)?.data;

    // 1. ВАШ СЛУЧАЙ: Данные лежат в поле "items"
    if (responseBody?.items && Array.isArray(responseBody.items)) {
      return responseBody.items;
    }

    // 2. Fallback: если структура изменится на data.data
    if (responseBody?.data && Array.isArray(responseBody.data)) {
      return responseBody.data;
    }

    // 3. Fallback: если вернется сразу массив
    if (Array.isArray(responseBody)) {
      return responseBody;
    }

    console.warn("Не удалось найти массив писем. Пришел ответ:", responseBody);
    return [];
  }, [data]);

  if (isLoading) {
    return (
      <aside className="w-[300px] h-full bg-white rounded-2xl p-4 flex items-center justify-center border-l border-gray-200 ml-2">
        <Loader />
      </aside>
    );
  }

  return (
    // Добавил border-l и ml-2 для визуального отделения от основного сайдбара
    <aside className="w-[300px] min-w-[300px] h-full bg-[#F5F6F8] rounded-2xl overflow-hidden flex flex-col ml-2 border border-gray-200">
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {list.length > 0 ? (
          list.map((item: any) => (
            <div
              key={item.id}
              onClick={() =>
                navigate(
                  AppRoutes.CORRESPONDENCE_INCOMING_SHOW.replace(
                    ":id",
                    String(item.id),
                  ),
                )
              }
              className="bg-white p-3 rounded-xl mb-2 cursor-pointer border border-transparent hover:border-blue-300 hover:shadow-sm transition-all"
            >
              {/* Тема */}
              <div className="font-bold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
                {item.subject || "Без темы"}
              </div>

              {/* Отправитель (вместо описания, так полезнее) */}
              <div className="text-xs text-gray-400 mb-3 line-clamp-1">
                {item.sender_name || "Отправитель не указан"}
              </div>

              {/* Статус и Дата */}
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`px-2 py-1 rounded-md text-[10px] font-medium truncate max-w-[65%] ${getStatusStyle(
                    item.status,
                  )}`}
                >
                  {getStatusName(item.status)}
                </span>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                  {/* Используем created_at или doc_date из вашего JSON */}
                  {new Date(
                    item.created_at || item.doc_date,
                  ).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm">Список писем пуст</p>
          </div>
        )}
      </div>
    </aside>
  );
};
