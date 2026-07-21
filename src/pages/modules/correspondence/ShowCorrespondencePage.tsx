import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  CorrespondenceForm,
  CorrespondenceFormData,
} from "@widgets/CorrespondenceForm";
import { Spin } from "antd";
import { ApiRoutes } from "@shared/api";
import { useCorrespondenceRoute, useGetQuery } from "@shared/lib";
import { InternalCorrespondece } from "@widgets/InternalCorrespondece";
import { CreateInternalCorrespondence } from "@widgets/CreateInternalCorrespondence";
import { InternalCorrespondenceIncomingView } from "@widgets/InternalCorrespondenceIncomingView";

interface ShowCorrespondencePageProps {
  type?: string;
}

export const ShowCorrespondencePage: React.FC<ShowCorrespondencePageProps> = ({
  type = "external-incoming",
}) => {
  const { id } = useParams<{ id: string }>();

  const location = useLocation();
  const navigate = useNavigate();

  const { shouldHideUI } = useCorrespondenceRoute();

  const isInternalView = type === "internal-incoming" || shouldHideUI;

  const currentApi = shouldHideUI
    ? ApiRoutes.GET_INTERNAL_BY_ID
    : ApiRoutes.GET_CORRESPONDENCE_BY_ID;

  const currentParam = shouldHideUI ? {} : { view: "full" };

  const { isLoading, data: correspondenceData } = useGetQuery({
    url: currentApi.replace(":id", String(id || "")),
    params: currentParam,
  });

  const handleFinish = (values: CorrespondenceFormData) => {
    console.log("Updating:", values);
  };

  if (isLoading) return <Spin />;

  const title = type.includes("incoming")
    ? `Входящее письмо #${id}`
    : `Исходящее письмо #${id}`;

  const data = correspondenceData?.data;

  const shouldOpenExecution = (location.state as { openExecution?: boolean })
    ?.openExecution;

  if (isInternalView) {
    // Если это именно ВХОДЯЩЕЕ внутреннее письмо — показываем твою новую страницу просмотра
    if (type === "internal-incoming") {
      const letterItem = data?.item || data;
      // Поля с префиксом my_ (my_prefix, my_folder) приходят в корне ответа,
      // а не внутри item — прокидываем my_prefix в item для «Номер (ВХ)».
      const incomingItem = letterItem
        ? {
            ...letterItem,
            my_prefix: data?.my_prefix ?? letterItem.my_prefix,
            // Списки действий над письмом бэкенд может отдать как внутри item,
            // так и в корне ответа (как my_prefix) — берём отовсюду.
            acknowledged_users:
              letterItem.acknowledged_users ?? data?.acknowledged_users,
            replied_users: letterItem.replied_users ?? data?.replied_users,
            forwarded_users:
              letterItem.forwarded_users ?? data?.forwarded_users,
          }
        : {
            id,
            subject: "",
            sender: "",
            date: "",
            inboundNumber: "",
            outboundNumber: "",
            status: "на резолюции",
          };
      return (
        <InternalCorrespondenceIncomingView
          item={incomingItem}
          onBack={() => navigate(-1)}
        />
      );
    }

    // Во всех остальных внутренних случаях (исходящие/черновики) рендерим форму редактора
    return (
      <CreateInternalCorrespondence
        id={id}
        initialData={data}
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 h-full overflow-hidden">
        <CorrespondenceForm
          type={type}
          title={title}
          initialValues={data}
          onFinish={handleFinish}
          isReadOnly={false}
          isLoading={isLoading}
          isAllowed={true}
          initialExecutionOpen={shouldOpenExecution}
          variant="view"
        />
      </div>
    </div>
  );
};
