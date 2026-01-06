import { lazy, Suspense } from "react";
import { Loader } from "@shared/ui";
import "./styles.css";

const Analytics = lazy(() =>
  import("@features/analytics").then((m) => ({ default: m.Analytics }))
);

export const AnalyticsPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Analytics />
    </Suspense>
  );
};
