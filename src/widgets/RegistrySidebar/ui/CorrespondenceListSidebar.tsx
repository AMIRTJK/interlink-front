import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { Loader } from "@shared/ui";
import { useNavigate, useParams } from "react-router-dom"; // 1. Добавили useParams
import { AppRoutes } from "@shared/config";
import { useMemo } from "react";

// Функция для стилизации статусов
const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s === "draft") return "bg-gray-200 text-gray-600";
  if (s === "to_register") return "bg-blue-100 text-blue-600";
  if (s === "to_execute") return "bg-[#FFA825] text-white";
  if (s === "registered") return "bg-[#7B54C4] text-white";
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
  const { id } = useParams(); // 2. Получаем текущий ID из URL

  const { data, isLoading } = useGetQuery({
    url: ApiRoutes.GET_CORRESPONDENCES,
    params: {
      kind: "incoming",
      page: 1,
      limit: 20,
    },
  });

  const list = useMemo(() => {
    const responseBody = (data as any)?.data;

    if (responseBody?.items && Array.isArray(responseBody.items)) {
      return responseBody.items;
    }
    if (responseBody?.data && Array.isArray(responseBody.data)) {
      return responseBody.data;
    }
    if (Array.isArray(responseBody)) {
      return responseBody;
    }

    // console.warn("Не удалось найти массив писем", responseBody);
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
    <aside className="w-[300px] min-w-[300px] h-full bg-[#F5F6F8] rounded-2xl overflow-hidden flex flex-col ml-2 border border-gray-200">
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {list.length > 0 ? (
          list.map((item: any) => {
            // 3. Проверяем, активен ли этот элемент
            // Приводим к строке, так как id из URL - это строка, а item.id - число
            const isActive = String(item.id) === id;

            return (
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
                // 4. Условные стили:
                // Если активен: синяя рамка, легкий синий фон, тень
                // Если не активен: белый фон, прозрачная рамка, ховер эффекты
                className={`p-3 rounded-xl mb-2 cursor-pointer border transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#F2F5FF] border-[#0037AF] shadow-sm ring-1 ring-[#0037AF]/20"
                      : "bg-white border-transparent hover:border-blue-300 hover:shadow-md"
                  }
                `}
              >
                {/* Тема */}
                <div
                  className={`font-bold text-sm mb-1 line-clamp-2 leading-tight ${
                    isActive ? "text-[#0037AF]" : "text-gray-900"
                  }`}
                >
                  {item.subject || "Без темы"}
                </div>

                {/* Отправитель */}
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
                    {new Date(
                      item.created_at || item.doc_date,
                    ).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm">Список писем пуст</p>
          </div>
        )}
      </div>
    </aside>
  );
};
