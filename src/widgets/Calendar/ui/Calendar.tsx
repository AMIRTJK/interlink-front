import { useState, useCallback, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarSidebar } from "./CalendarSidebar";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { CreateTaskModal } from "@features/Calendar";
import { EventDetailsModal } from "./EventDetailsModal";
import type { Task } from "@features/tasks";
import { useCalendarEvents } from "@shared/lib/hooks/useCalendarEvents";
import { useCalendarView } from "@shared/lib/hooks/useCalendarView";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

export const Calendar = memo(() => {
  const { tasks: serverTasks, currentDate, setCurrentDate, fetchEvents } = useCalendarEvents();

  const {
    viewMode,
    setViewMode,
    daysToShow,
  } = useCalendarView({ currentDate, onDateChange: setCurrentDate });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Task | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: Dayjs;
    time: Dayjs;
  } | null>(null);

  // Use only real tasks from the server (no mock data)
  const allTasks: Task[] = serverTasks || [];

  const { mutate: deleteEvent } = useMutationQuery<string>({
    method: "DELETE",
    url: (eventId) => `${ApiRoutes.GET_EVENTS}/${eventId}`,
    messages: {
      success: "Событие удалено!",
      error: "Не удалось удалить событие",
      invalidate: [ApiRoutes.GET_EVENTS],
    },
  });

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      deleteEvent(eventId);
    },
    [deleteEvent]
  );

  const handleEventClick = useCallback((task: Task) => {
    setSelectedEvent(task);
  }, []);

  const handleCloseEventDetails = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleDayClick = useCallback((date: Dayjs, selectedHour?: number) => {
    const finalTime =
      selectedHour !== undefined
        ? dayjs().hour(selectedHour).minute(0)
        : dayjs().hour(9).minute(0);

    setSelectedDateTime({
      date,
      time: finalTime,
    });
    setIsModalOpen(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setSelectedDateTime({
      date: currentDate,
      time: dayjs().hour(9).minute(0),
    });
    setIsModalOpen(true);
  }, [currentDate]);

  const handleCancelCreate = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDateTime(null);
  }, []);

  const handleTaskCreated = useCallback(() => {
    fetchEvents();
    setIsModalOpen(false);
    setSelectedDateTime(null);
  }, [fetchEvents]);

  const renderActiveView = () => {
    if (viewMode === "month") {
      return (
        <MonthView
          daysToShow={daysToShow}
          tasks={allTasks}
          currentDate={currentDate}
          onDeleteEvent={handleDeleteEvent}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
        />
      );
    }
    if (viewMode === "week") {
      return (
        <WeekView
          daysToShow={daysToShow}
          tasks={allTasks}
          currentDate={currentDate}
          onDeleteEvent={handleDeleteEvent}
          onDayClick={handleDayClick}
          onHeaderClick={setCurrentDate}
          onEventClick={handleEventClick}
        />
      );
    }
    return (
      <DayView
        currentDate={currentDate}
        tasks={allTasks}
        onDeleteEvent={handleDeleteEvent}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />
    );
  };

  return (
    <div className="w-full! flex! flex-col! lg:flex-row! gap-6! p-1!">
      {/* Left Sidebar */}
      <CalendarSidebar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        tasks={allTasks}
        onCreateEvent={handleCreateClick}
        onEventClick={handleEventClick}
      />

      {/* Main Calendar View Area */}
      <div className="flex-1! flex! flex-col! gap-2! min-w-0!">
        <CalendarHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentDate={currentDate}
        />

        <div className="w-full! transition-all! duration-300!">
          {renderActiveView()}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleCancelCreate}
        selectedDateTime={selectedDateTime}
        onSuccess={handleTaskCreated}
        mode="create"
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={handleCloseEventDetails}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
});
