import { RegistryTable } from "@widgets/RegistryTable";
import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { ApiRoutes } from "@shared/api";

interface IncomingTableWrapperProps {
  type: string;
  createButtonText?: string;
  baseParams?: Record<string, unknown>;
}

export const CorrespondenceTableWrapper = ({
  type,
  createButtonText,
  baseParams,
}: IncomingTableWrapperProps) => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folderId");

  const { params, url } = useMemo(() => {
    let currentParams = { ...baseParams };

    const currentUrl = ApiRoutes.GET_CORRESPONDENCES;

    // Если в URL есть defaultFolder (папки "Полученные"/"Отправленные"),
    // добавляем фильтрацию по внутреннему каналу через параметр channel
    const defaultFolder = searchParams.get("defaultFolder");
    if (defaultFolder) {
      currentParams = {
        ...currentParams,
        channel: "internal",
      };
    }

    // EXTERNAL-INCOMING
    if (type === "external-incoming" || type === "external-outgoing") {
      return {
        params: currentParams,
        url: currentUrl,
      };
    }

    if (type === "internal-incoming") {
      return {
        params: { ...currentParams },
        url: ApiRoutes.GET_INTERNAL_INCOMING,
      };
    }

    if (type === "internal-outgoing") {
      return {
        params: { ...currentParams },
        url: ApiRoutes.GET_INTERNAL_OUTGOING,
      };
    }

    if (type === "internal-drafts") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_DRAFTS,
      };
    }

    if (type === "internal-to-sign") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_TO_SIGN,
      };
    }

    if (type === "internal-to-approve") {
      return {
        params: currentParams,
        url: ApiRoutes.GET_INTERNAL_TO_APPROVE,
      };
    }

    if (folderId) {
      return {
        params: {
          ...currentParams,
          folder_id: parseInt(folderId, 10),
        },
        url: currentUrl,
      };
    }

    return {
      params: currentParams,
      url: currentUrl,
    };
  }, [baseParams, folderId, searchParams, type]);

  return (
    <>
      <RegistryTable
        type={type}
        createButtonText={createButtonText}
        extraParams={params}
        url={url}
      />
    </>
  );
};
