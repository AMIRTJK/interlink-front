import { useState } from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { Task } from "@features/tasks";
import { TaskCard } from "./TaskCard";
import "./calendar.css";
dayjs.extend(isoWeek);
interface WeeklyCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Dayjs, time: string) => void;
}
type ViewMode = 'week' | 'month' | 'day';
export const WeeklyCalendar = ({ tasks, onTaskClick, onTimeSlotClick }: WeeklyCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const startOfWeek = currentDate.startOf('isoWeek');
  const endOfWeek = currentDate.endOf('isoWeek');
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    startOfWeek.add(i, 'day')
  );
  const goToPrevWeek = () => {
    setCurrentDate(currentDate.subtract(1, 'week'));
  };
  const goToNextWeek = () => {
    setCurrentDate(currentDate.add(1, 'week'));
  };
  const getTasksForDay = (day: Dayjs) => {
    return tasks.filter(task => 
      dayjs(task.date).isSame(day, 'day')
    );
  };
  const formatDateRange = () => {
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
  const showTimeLine = weekDays.some(day => isToday(day));
  return (
    <div className="weekly-calendar">
      <div className="weekly-calendar__header">
        <div className="weekly-calendar__nav">
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={goToPrevWeek}
          />
          <span className="weekly-calendar__date-range">
            {formatDateRange()}
          </span>
          <Button 
            type="text" 
            icon={<RightOutlined />} 
            onClick={goToNextWeek}
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
        <div className="weekly-calendar__days">
          {weekDays.map((day) => (
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
                {getTasksForDay(day).map((task) => {
                  const taskHour = parseInt(task.time.split(':')[0]);
                  const taskMinute = parseInt(task.time.split(':')[1]);
                  const topPosition = (taskHour + taskMinute / 60) * 60;
                  return (
                    <div
                      key={task.id}
                      className="weekly-calendar__task-wrapper"
                      style={{ top: `${topPosition}px` }}
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
