import { useState } from "react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { TaskDetailsModal, CreateTaskModal } from "@features/Calendar";
import { useCalendarEvents } from "@shared/lib/hooks/useCalendarEvents";
import type { Task } from "@features/tasks";
import dayjs, { Dayjs } from "dayjs";

// import "@features/calendar/task-details-modal.css";

/**
 * Компонент Calendar является корневым для функционала календаря.
 * Он управляет состоянием событий, модальными окнами создания/просмотра задач
 * и обеспечивает интеграцию между API и UI календаря.
 */
export const Calendar = () => {
  const { tasks, currentDate, setCurrentDate, fetchEvents, search, setSearch } =
    useCalendarEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: Dayjs;
    time: Dayjs;
  } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editEvent, setEditEvent] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const handleTimeSlotClick = (date: Dayjs, time: string) => {
    const [hours, minutes] = time.split(":");
    const timeObj = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));

    setSelectedDateTime({
      date: date,
      time: timeObj,
    });
    setEditEvent(null);
    setIsModalOpen(true);
  };

  const handleCancelCreate = () => {
    setIsModalOpen(false);
    setSelectedDateTime(null);
    setEditEvent(null);
  };

  const handleTaskCreated = () => {
    fetchEvents();
    setIsModalOpen(false);
    setSelectedDateTime(null);
    setEditEvent(null);
  };

  const handleEditTask = (task: Task) => {
    setEditEvent(task);
    setIsViewModalOpen(false);
    setIsModalOpen(true);
  };

  const getInitialValues = () => {
    if (editEvent) {
      return {
        title: editEvent.title,
        description: editEvent.description,
        date: dayjs(editEvent.date),
        time: dayjs(`${editEvent.date} ${editEvent.time}`),
        endTime: editEvent.endTime
          ? dayjs(`${editEvent.date} ${editEvent.endTime}`)
          : undefined,
        color: editEvent.color,
        assignees: editEvent.participants?.map((p) => Number(p.id)) || [],
        status: "pending", // Default or fetched if available. Task type misses it currently.
      };
    }
    return undefined;
  };

  return (
    <div className="profile-page">
      <WeeklyCalendar
        tasks={tasks}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onTaskClick={handleTaskClick}
        onTimeSlotClick={handleTimeSlotClick}
        search={search}
        onSearch={setSearch}
      />

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleCancelCreate}
        selectedDateTime={selectedDateTime}
        initialValues={getInitialValues()}
        onSuccess={handleTaskCreated}
        mode={editEvent ? "edit" : "create"}
        eventId={editEvent?.id.toString()}
      />

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleEditTask}
      />
    </div>
  );
};
