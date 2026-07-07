import React, { useState } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { CreateTaskModal } from "@features/Calendar";
import { useCalendarEvents } from "@shared/lib/hooks/useCalendarEvents";
import { useCalendarView } from "@shared/lib/hooks/useCalendarView";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import dayjs, { Dayjs } from "dayjs";

export const Calendar = () => {
  const { tasks, currentDate, setCurrentDate, fetchEvents } = useCalendarEvents();

  const {
    viewMode,
    setViewMode,
    daysToShow,
    goToPrev,
    goToNext,
    formatDateRange,
  } = useCalendarView({ currentDate, onDateChange: setCurrentDate });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: Dayjs;
    time: Dayjs;
  } | null>(null);

  const { mutate: deleteEvent } = useMutationQuery<string>({
    method: "DELETE",
    url: (eventId) => `${ApiRoutes.GET_EVENTS}/${eventId}`,
    messages: {
      success: "Событие удалено!",
      error: "Не удалось удалить событие",
      invalidate: [ApiRoutes.GET_EVENTS],
    },
  });

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const handleDayClick = (date: Dayjs, selectedHour?: number) => {
    const finalTime = selectedHour !== undefined 
      ? dayjs().hour(selectedHour).minute(0) 
      : dayjs().hour(9).minute(0);

    setSelectedDateTime({
      date,
      time: finalTime,
    });
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedDateTime({
      date: currentDate,
      time: dayjs().hour(9).minute(0),
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

  const handleHeaderClick = (date: Dayjs) => {
    setCurrentDate(date);
  };

  const renderActiveView = () => {
    if (viewMode === "month") {
      return (
        <MonthView
          daysToShow={daysToShow}
          tasks={tasks}
          currentDate={currentDate}
          onDeleteEvent={handleDeleteEvent}
          onDayClick={handleDayClick}
        />
      );
    }
    if (viewMode === "week") {
      return (
        <WeekView
          daysToShow={daysToShow}
          tasks={tasks}
          currentDate={currentDate}
          onDeleteEvent={handleDeleteEvent}
          onDayClick={handleDayClick}
          onHeaderClick={handleHeaderClick}
        />
      );
    }
    return (
      <DayView
        currentDate={currentDate}
        tasks={tasks}
        onDeleteEvent={handleDeleteEvent}
        onDayClick={handleDayClick}
      />
    );
  };

  return (
    <div className="w-full! flex! flex-col! gap-4!">
      <CalendarHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        onPrev={goToPrev}
        onNext={goToNext}
        dateRange={formatDateRange()}
        onToday={() => setCurrentDate(dayjs())}
        onCreateEvent={handleCreateClick}
      />

      <div className="w-full! transition-all! duration-300!">
        {renderActiveView()}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleCancelCreate}
        selectedDateTime={selectedDateTime}
        onSuccess={handleTaskCreated}
        mode="create"
      />
    </div>
  );
};
