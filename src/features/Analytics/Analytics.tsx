import { useEffect, lazy, Suspense } from "react";
import { useAnalytics } from "@shared/lib/hooks/useAnalytics";
import { tokenControl } from "@shared/lib";
import { If, Loader } from "@shared/ui";
import { UseSkeleton } from "@shared/ui/Skeleton/ui";

const Alert = lazy(() =>
  import("antd/es/alert").then((m) => ({ default: m.default }))
);

const HeroSection = lazy(() =>
  import("./ui/HeroSection").then((m) => ({ default: m.HeroSection }))
);

const ActivityChart = lazy(() =>
  import("./ui/ActivityChart").then((m) => ({ default: m.ActivityChart }))
);

export const Analytics = () => {
  const userId = tokenControl.getUserId();
  const { mutate, data, isError, isPending } = useAnalytics();

  useEffect(() => {
    if (userId) {
      mutate({
        userId,
        date: new Date().toISOString(),
      });
    }
  }, [mutate, userId]);

  const hero = data?.hero;
  const activity = data?.activity;

  return (
    <div className="profile-page p-6">
      <div className="analytics-container max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Аналитика
        </h2>
        <If is={isPending}>
          <UseSkeleton loading={true} variant="card" count={1} rows={5}  />
        </If>
        <If is={isError}>
          <Suspense fallback={null}>
            <Alert
              message="Ошибка загрузки"
              description="Не удалось загрузить данные аналитики."
              type="error"
              showIcon
              className="mb-6"
            />
          </Suspense>
        </If>

        {hero && activity && (
          <Suspense fallback={<Loader />}>
            <div className="space-y-6">
              <HeroSection data={hero} />
              <ActivityChart data={activity} />
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
};
