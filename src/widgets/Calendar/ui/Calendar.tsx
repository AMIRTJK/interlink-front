import { useState, useEffect, useCallback } from "react";
import { Modal } from "antd";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { AddTaskForm } from "@features/tasks";
import type { Task, EventResponse } from "@features/tasks";
import dayjs, { Dayjs } from "dayjs";

import { _axios, ApiRoutes } from "@shared/api";
import { toast } from "react-toastify";

const mapEventToTask = (event: EventResponse): Task => {
  const startDate = dayjs(event.start_at);
  const endDate = dayjs(event.end_at);
  
  return {
    id: String(event.id),
    title: event.title,
    date: startDate.format("YYYY-MM-DD"),
    time: startDate.format("HH:mm"),
    endTime: endDate.format("HH:mm"),
    category: "work",
    color: event.color,
    participants: event.participants.map(p => ({
      id: String(p.id),
      name: p.full_name,
      avatar: p.photo_path || undefined
    })),
  };
};

export const Calendar = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Dayjs; time: Dayjs } | null>(null);

  const handleTaskClick = (task: Task) => {
    console.log("Task clicked:", task);
  };

  const handleTimeSlotClick = (date: Dayjs, time: string) => {
    const [hours, minutes] = time.split(':');
    const timeObj = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
    
    setSelectedDateTime({
      date: date,
      time: timeObj,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedDateTime(null);
  };

  const fetchEvents = useCallback(async () => {
      try {
        const from = currentDate.startOf('month').subtract(7, 'day').format('YYYY-MM-DD');
        const to = currentDate.endOf('month').add(7, 'day').format('YYYY-MM-DD');
        
        const response = await _axios.get<{ data: EventResponse[] }>(ApiRoutes.GET_EVENTS, {
          params: { from, to }
        });
        const mappedTasks = response.data.data.map(mapEventToTask);
        setTasks(mappedTasks);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Не удалось загрузить события");
      }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);



  const handleTaskCreated = (response: EventResponse | unknown) => {
    const event = response as EventResponse;
    const newTask = mapEventToTask(event);

    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
    setSelectedDateTime(null);
  };

  return (
    <div className="profile-page">
      <div className="calendar-page-container">
        <WeeklyCalendar 
          tasks={tasks} 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onTaskClick={handleTaskClick}
          onTimeSlotClick={handleTimeSlotClick}
        />

        <Modal
          title="Добавить задачу"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <AddTaskForm 
            initialValues={selectedDateTime ? {
              date: selectedDateTime.date,
              time: selectedDateTime.time,
            } : undefined}
            onSuccess={handleTaskCreated}
            isEvent={true}
          />
        </Modal>
      </div>
    </div>
  );
};
