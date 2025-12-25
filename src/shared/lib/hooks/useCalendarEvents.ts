import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { _axios, ApiRoutes } from "@shared/api";
import { toast } from "react-toastify";
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
  const [search, setSearch] = useState("");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Диапазон: от первого числа этого месяца до конца текущего выбранного месяца
      const from = currentDate.startOf("month").format("YYYY-MM-DD");
      const to = currentDate.endOf("month").format("YYYY-MM-DD");

      const response = await _axios.get<{ data: EventResponse[] }>(
        ApiRoutes.GET_EVENTS,
        { 
          params: { 
            from, 
            to, 
            title: search || undefined 
          } 
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
  }, [currentDate, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    tasks,
    currentDate,
    setCurrentDate,
    fetchEvents,
    isLoading,
    search,
    setSearch,
  };
};
