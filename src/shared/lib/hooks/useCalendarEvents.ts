import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import type { Task, EventResponse } from "@features/tasks";

const mapEventToTask = (event: EventResponse): Task => {
  const datePart = event.start_at.split("T")[0];
  const timePart = event.start_at.split("T")[1].substring(0, 5);
  const endTimePart = event.end_at
    ? event.end_at.split("T")[1].substring(0, 5)
    : undefined;

  return {
    id: String(event.id),
    title: event.title,
    description: event.description,
    date: datePart,
    time: timePart,
    endTime: endTimePart,
    category: "work",
    color: event.color,
    participants: (event.participants || []).map((p) => ({
      id: String(p.id),
      name: p.full_name,
      avatar: p.photo_path || undefined,
    })),
  };
};

const cacheOptions = {
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

export const useCalendarEvents = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [search, setSearch] = useState("");

  const dateParams = useMemo(() => {
    const gridStart = currentDate.startOf("month").startOf("isoWeek");
    return {
      from: gridStart.format("YYYY-MM-DD"),
      to: gridStart.add(42, "day").format("YYYY-MM-DD"),
      title: search || undefined,
    };
  }, [currentDate, search]);

  const { data, isLoading, refetch } = useGetQuery<
    typeof dateParams,
    { data: EventResponse[] }
  >({
    url: ApiRoutes.GET_EVENTS,
    params: dateParams,
    useToken: true,
    options: cacheOptions,
  });

  const tasks = useMemo(() => {
    const rawList = Array.isArray(data?.data) ? data.data : [];
    return rawList.map(mapEventToTask);
  }, [data]);

  return {
    tasks,
    currentDate,
    setCurrentDate,
    fetchEvents: refetch,
    isLoading,
    search,
    setSearch,
  };
};
