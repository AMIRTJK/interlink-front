import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { Loader } from "@shared/ui";
import { useNavigate, useParams } from "react-router-dom";
import { AppRoutes } from "@shared/config";
import { useMemo } from "react";

const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s === "draft") return "bg-gray-200 text-gray-600";
  if (s === "to_register") return "bg-blue-100 text-blue-600";
  if (s === "to_execute") return "bg-[#FFA825] text-white";
  if (s === "registered") return "bg-[#7B54C4] text-white";
  return "bg-gray-100 text-gray-500";
};

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
  const { id } = useParams();

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

    return [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-20 bg-white rounded-2xl p-4 flex items-center justify-center border border-gray-200">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F6F8] rounded-2xl overflow-hidden flex flex-col border border-gray-200">
      <div className="flex flex-row items-center gap-2 overflow-x-auto p-2 custom-scrollbar no-scrollbar">
        {list.length > 0 ? (
          list.map((item: any) => {
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
                className={`p-3 rounded-xl cursor-pointer border transition-all duration-200 shrink-0 w-[280px]
                  ${
                    isActive
                      ? "bg-[#F2F5FF] border-[#0037AF] shadow-sm ring-1 ring-[#0037AF]/20"
                      : "bg-white border-transparent hover:border-blue-300 hover:shadow-md"
                  }
                `}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div
                      className={`font-bold text-xs mb-1 line-clamp-1 leading-tight ${
                        isActive ? "text-[#0037AF]" : "text-gray-900"
                      }`}
                    >
                      {item.subject || "Без темы"}
                    </div>
                    <div className="text-[10px] text-gray-400 mb-2 line-clamp-1">
                      {item.sender_name || "Отправитель не указан"}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-medium truncate max-w-[60%] ${getStatusStyle(
                        item.status,
                      )}`}
                    >
                      {getStatusName(item.status)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap ml-2">
                      {new Date(
                        item.created_at || item.doc_date,
                      ).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center w-full py-4 text-gray-400">
            <p className="text-xs">Список писем пуст</p>
          </div>
        )}
      </div>
    </div>
  );
};
