import { useEffect, useRef, useState } from "react";
import { _axios, ApiRoutes } from "@shared/api";
import { queryClient, tokenControl } from "@shared/lib";
import {
  PROFILE_WARMUP_QUERY_KEY,
  TWarmupImport,
  WELCOME_FALLBACK_NAME,
} from "./model";

const PROGRESS_TICK_MS = 120;
const TASK_WEIGHT = 0.55;
const TIME_WEIGHT = 0.45;
const WARMUP_STALE_TIME_MS = 30000;

const fetchProfile = async () => {
  const token = tokenControl.get();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await _axios(ApiRoutes.AUTH_ME, {
    method: "GET",
    params: {},
    headers,
  });
  return response.data;
};

export const useReducedMotion = () => {
  const [isReduced, setIsReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) =>
      setIsReduced(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isReduced;
};

export const useProfileWarmup = (
  imports: TWarmupImport[],
  durationMs: number,
) => {
  const [progress, setProgress] = useState(0);
  const [isWarm, setIsWarm] = useState(false);
  const doneRef = useRef(0);

  useEffect(() => {
    let isActive = true;
    doneRef.current = 0;

    const tasks: Promise<unknown>[] = [
      queryClient.prefetchQuery({
        queryKey: PROFILE_WARMUP_QUERY_KEY,
        queryFn: fetchProfile,
        staleTime: WARMUP_STALE_TIME_MS,
      }),
      ...imports.map((load) => load()),
    ];

    tasks.forEach((task) => {
      task
        .catch(() => undefined)
        .then(() => {
          doneRef.current += 1;
        });
    });

    Promise.allSettled(tasks).then(() => {
      if (isActive) setIsWarm(true);
    });

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (!isActive) return;
      const byTasks = doneRef.current / tasks.length;
      const byTime = Math.min(1, (Date.now() - startedAt) / durationMs);
      setProgress(Math.min(1, byTasks * TASK_WEIGHT + byTime * TIME_WEIGHT));
    }, PROGRESS_TICK_MS);

    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [durationMs, imports]);

  return { progress, isWarm };
};

export const useTimedPhase = <T extends string>(
  steps: readonly { phase: T; at: number }[],
) => {
  const [phase, setPhase] = useState<T>(steps[0].phase);

  useEffect(() => {
    const timers = steps
      .slice(1)
      .map((step) =>
        window.setTimeout(() => setPhase(step.phase), Math.max(0, step.at)),
      );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [steps]);

  return phase;
};

export const resolveUserName = (): string => {
  const cached = queryClient.getQueryData<any>(PROFILE_WARMUP_QUERY_KEY);
  const raw =
    cached?.data?.user ||
    cached?.user ||
    cached?.data ||
    tokenControl.getUserData();

  if (!raw || typeof raw !== "object") return WELCOME_FALLBACK_NAME;

  const composed = [raw.first_name, raw.last_name].filter(Boolean).join(" ");
  return composed || raw.full_name || WELCOME_FALLBACK_NAME;
};
