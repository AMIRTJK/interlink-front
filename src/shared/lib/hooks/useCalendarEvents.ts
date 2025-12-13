import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { _axios, ApiRoutes } from "@shared/api";
import { toast } from "react-toastify";
import type { Task, EventResponse } from "@features/tasks";

const mapEventToTask = (event: EventResponse): Task => {
  const startDate = dayjs(event.start_at);
  const endDate = dayjs(event.end_at);

  return {
    id: String(event.id),
    title: event.title,
    description: event.description,
    date: startDate.format("YYYY-MM-DD"),
    time: startDate.format("HH:mm"),
    endTime: endDate.format("HH:mm"),
    category: "work",
    color: event.color,
    participants: event.participants.map((p) => ({
      id: String(p.id),
      name: p.full_name,
      avatar: p.photo_path || undefined,
    })),
  };
};

export const useCalendarEvents = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const from = currentDate
        .startOf("month")
        .subtract(7, "day")
        .format("YYYY-MM-DD");
      const to = currentDate
        .endOf("month")
        .add(7, "day")
        .format("YYYY-MM-DD");

      const response = await _axios.get<{ data: EventResponse[] }>(
        ApiRoutes.GET_EVENTS,
        {
          params: { from, to },
        }
      );
      const mappedTasks = response.data.data.map(mapEventToTask);
      setTasks(mappedTasks);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Не удалось загрузить события");
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    tasks,
    currentDate,
    setCurrentDate,
    fetchEvents,
    isLoading,
  };
};
