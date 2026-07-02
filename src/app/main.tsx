import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { queryClient } from "@shared/lib";
import { App } from "./App";
import dayjs from "dayjs";
import "dayjs/locale/ru";
// Self-hosted Inter (used by the Administration module design, no CDN)
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "./styles/global.css";
dayjs.locale("ru");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ruRU}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>
);
