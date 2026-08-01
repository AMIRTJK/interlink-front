import * as React from "react";
import { AdministrationHomeWidget } from "@widgets/Administration";

// Главная страница модуля «Администрирование»: тонкая точка монтирования (FSD §3)
export const AdministrationHomePage: React.FC = () => {
  return (
    <div className="-mx-6 -mt-4 -mb-4 w-[calc(100%+3rem)] flex-1 flex flex-col min-h-0">
      <AdministrationHomeWidget />
    </div>
  );
};
