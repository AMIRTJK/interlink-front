import * as React from "react";
import { AdministrationHomeWidget } from "@widgets/Administration";

// Главная страница модуля «Администрирование»: тонкая точка монтирования (FSD §3)
export const AdministrationHomePage: React.FC = () => {
  return <AdministrationHomeWidget />;
};
