import { RegistryTable } from "@widgets/RegistryTable";
import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { ApiRoutes } from "@shared/api";

interface IncomingTableWrapperProps {
  type: "incoming" | "outgoing";
  createButtonText?: string;
  baseParams: Record<string, unknown>;
}

export const CorrespondenceTableWrapper = ({ 
  type, 
  createButtonText, 
  baseParams 
}: IncomingTableWrapperProps) => {
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folderId");

  const { params, url } = useMemo(() => {
    const currentParams = { ...baseParams };
    let currentUrl: string = ApiRoutes.GET_CORRESPONDENCES;

    // Если в URL есть defaultFolder (папки "Полученные"/"Отправленные"), 
    // меняем эндпоинт на специфичные пути согласно новому списку АПИ
    const defaultFolder = searchParams.get("defaultFolder");
    if (defaultFolder) {
      // Убираем кавычки из значения, если они есть (на случай "?defaultFolder="sent"")
      const folderValue = defaultFolder.replace(/"/g, "");

      if (folderValue === "received") {
        currentUrl = ApiRoutes.GET_INTERNAL_INCOMING;
      } else if (folderValue === "sent") {
        currentUrl = ApiRoutes.GET_INTERNAL_OUTGOING;
      }
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
  }, [baseParams, folderId, searchParams]);

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
