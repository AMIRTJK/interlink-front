import { useState } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { Task } from "@features/tasks";
import { TaskCard } from "@features/calendar";
import "./calendar.css";
dayjs.extend(isoWeek);
import type { ViewMode } from "../model";

interface WeeklyCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Dayjs, time: string) => void;
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}

export const WeeklyCalendar = ({ tasks, onTaskClick, onTimeSlotClick, currentDate, onDateChange }: WeeklyCalendarProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const startOfWeek = viewMode === 'month' 
    ? currentDate.startOf('month').startOf('isoWeek')
    : viewMode === 'day'
      ? currentDate
      : currentDate.startOf('isoWeek');

  const endOfWeek = viewMode === 'month'
    ? currentDate.endOf('month').endOf('isoWeek')
    : viewMode === 'day'
      ? currentDate
      : currentDate.endOf('isoWeek');

  const daysToShow = viewMode === 'day' 
    ? [currentDate]
    : viewMode === 'month'
      ? Array.from({ length: 42 }, (_, i) => startOfWeek.add(i, 'day'))
      : Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const goToPrev = () => {
    if (viewMode === 'day') onDateChange(currentDate.subtract(1, 'day'));
    else if (viewMode === 'week') onDateChange(currentDate.subtract(1, 'week'));
    else onDateChange(currentDate.subtract(1, 'month'));
  };

  const goToNext = () => {
    if (viewMode === 'day') onDateChange(currentDate.add(1, 'day'));
    else if (viewMode === 'week') onDateChange(currentDate.add(1, 'week'));
    else onDateChange(currentDate.add(1, 'month'));
  };
  const getTasksForDay = (day: Dayjs) => {
    return tasks.filter(task => 
      dayjs(task.date).isSame(day, 'day')
    );
  };

  const formatDateRange = () => {
    if (viewMode === 'day') return currentDate.format('D MMMM YYYY');
    if (viewMode === 'month') return currentDate.format('MMMM YYYY');
    return `${startOfWeek.format('D')} - ${endOfWeek.format('D MMMM YYYY')} г.`;
  };
  const isToday = (day: Dayjs) => day.isSame(dayjs(), 'day');
  const getCurrentTimePosition = () => {
    const now = dayjs();
    const hours = now.hour();
    const minutes = now.minute();
    return hours + minutes / 60;
  };
  const handleTimeSlotClick = (day: Dayjs, hour: number) => {
    if (onTimeSlotClick) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      onTimeSlotClick(day, time);
    }
  };
  const currentTimePosition = getCurrentTimePosition();
  const showTimeLine = daysToShow.some(day => isToday(day));
  return (
    <div className="weekly-calendar">
      <div className="weekly-calendar__header">
        <div className="weekly-calendar__nav">
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={goToPrev}
          />
          <span className="weekly-calendar__date-range">
            {formatDateRange()}
          </span>
          <Button 
            type="text" 
            icon={<RightOutlined />} 
            onClick={goToNext}
          />
        </div>
        <div className="weekly-calendar__view-switcher">
          <Button 
            type={viewMode === 'week' ? 'primary' : 'text'}
            onClick={() => setViewMode('week')}
          >
            Неделя
          </Button>
          <Button 
            type={viewMode === 'month' ? 'primary' : 'text'}
            onClick={() => setViewMode('month')}
          >
            Месяц
          </Button>
          <Button 
            type={viewMode === 'day' ? 'primary' : 'text'}
            onClick={() => setViewMode('day')}
          >
            День
          </Button>
        </div>
      </div>
      <div className="weekly-calendar__grid">
        <div className="weekly-calendar__time-column">
          <div className="weekly-calendar__time-header">Сейчас</div>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="weekly-calendar__time-slot">
              {i.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
        <div className={`weekly-calendar__days ${viewMode}`}>
          {daysToShow.map((day) => (
            <div 
              key={day.format('YYYY-MM-DD')} 
              className={`weekly-calendar__day-column ${isToday(day) ? 'weekly-calendar__day-column--today' : ''}`}
            >
              <div className="weekly-calendar__day-header">
                <div className="weekly-calendar__day-name">
                  {day.format('dddd DD')}
                </div>
              </div>
              <div className="weekly-calendar__day-content">
                {Array.from({ length: 24 }, (_, i) => (
                  <div 
                    key={i} 
                    className="weekly-calendar__hour-line"
                    style={{ top: `${i * 60}px` }}
                    onClick={() => handleTimeSlotClick(day, i)}
                  />
                ))}
                {showTimeLine && isToday(day) && (
                  <div 
                    className="weekly-calendar__current-time-line"
                    style={{ top: `${currentTimePosition * 60}px` }}
                  />
                )}
                {getTasksForDay(day).map((task, index) => {
                  const taskHour = parseInt(task.time.split(':')[0]);
                  const taskMinute = parseInt(task.time.split(':')[1]);
                  const topPosition = (taskHour + taskMinute / 60) * 60;
                  
                  const leftOffset = Math.min(index * 15, 60);
                  const width = `calc(100% - ${leftOffset}px)`;
                  
                  return (
                    <div
                      key={task.id}
                      className="weekly-calendar__task-wrapper"
                      style={{ 
                        top: `${topPosition}px`,
                        left: `${leftOffset}px`,
                        width: width,
                        zIndex: 10 + index
                      }}
                    >
                      <TaskCard 
                        task={task} 
                        onClick={() => onTaskClick?.(task)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
