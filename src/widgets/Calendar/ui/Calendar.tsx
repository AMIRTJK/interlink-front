import { useState } from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { TaskDetailsModal, CreateTaskModal } from "@features/calendar";
import { useCalendarEvents } from "@shared/lib/hooks/useCalendarEvents";
import type { Task } from "@features/tasks";
import dayjs, { Dayjs } from "dayjs";

import "@features/calendar/task-details-modal.css";

export const Calendar = () => {
  const { tasks, currentDate, setCurrentDate, fetchEvents } = useCalendarEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Dayjs; time: Dayjs } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
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

  const handleCancelCreate = () => {
    setIsModalOpen(false);
    setSelectedDateTime(null);
  };

  const handleTaskCreated = () => {
    fetchEvents();
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

        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={handleCancelCreate}
          selectedDateTime={selectedDateTime}
          onSuccess={handleTaskCreated}
        />

        <TaskDetailsModal
          task={selectedTask}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        />
      </div>
    </div>
  );
};
