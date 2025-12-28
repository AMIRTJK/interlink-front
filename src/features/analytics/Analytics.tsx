import { useEffect } from "react";
import {  Alert } from "antd";
import { useAnalytics } from "@shared/lib/hooks/useAnalytics";
import { tokenControl } from "@shared/lib";
import { HeroSection } from "./ui/HeroSection";
import { ActivityChart } from "./ui/ActivityChart";
import { If, Loader } from "@shared/ui";

export const Analytics = () => {
  const userId = tokenControl.getUserId();
  const { mutate, data, isLoading, isError } = useAnalytics();

  useEffect(() => {
    if (userId) {
      mutate({ 
        userId: userId, 
        date: new Date().toISOString() 
      });
    }
  }, [mutate, userId]);

  return (
    <div className="profile-page p-6">
      <div className="analytics-container max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Аналитика</h2>
        <If is={isLoading}>
          <Loader/>
        </If>
       <If is={isError}>
          <Alert
            message="Ошибка загрузки"
            description="Не удалось загрузить данные аналитики."
            type="error"
            showIcon
            className="mb-6"
          />
       </If>
        {data && (
          <div className="space-y-6">
            <HeroSection data={data.hero} />
            <ActivityChart data={data.activity} />
          </div>
        )}
      </div>
    </div>
  );
};
