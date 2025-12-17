import { Popover, Button } from "antd";
import { CloseOutlined, HistoryOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { TaskCard } from "@features/calendar";
import { ViewMode } from "../model";
import { calculateDayLayout } from "../lib";

interface IProps {
  daysToShow: Dayjs[];
  viewMode: ViewMode;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Dayjs, time: string) => void;
  isToday: (date: Dayjs) => boolean;
}

export const CalendarGrid = ({
  daysToShow,
  viewMode,
  tasks,
  onTaskClick,
  onTimeSlotClick,
  isToday,
}: IProps) => {
  const [openClusterId, setOpenClusterId] = useState<string | null>(null);

  const getTasksForDay = (day: Dayjs) => {
    const targetDate = day.format("YYYY-MM-DD");
    return tasks.filter((task) => {
      return task.date === targetDate;
    });
  };
  console.log("TASK: ", tasks);

  const getCurrentTimePosition = () => {
    const now = dayjs();
    const hours = now.hour();
    const minutes = now.minute();
    return hours + minutes / 60;
  };

  const handleTimeSlotClick = (day: Dayjs, hour: number) => {
    if (onTimeSlotClick) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      onTimeSlotClick(day, time);
    }
  };

  const currentTimePosition = getCurrentTimePosition();
  const showTimeLine = daysToShow.some((day) => isToday(day));

  return (
    <div className="weekly-calendar__grid">
      <div className="weekly-calendar__time-column">
        <div className="weekly-calendar__time-header">
          {" "}
          <Button
            type="text"
            shape="circle"
            style={{ width: 40, height: 40, padding: 0 }}
            icon={
              <HistoryOutlined style={{ fontSize: 20, color: "#C3CAD9" }} />
            }
          />
        </div>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="weekly-calendar__time-slot">
            {i.toString().padStart(2, "0")}
          </div>
        ))}
      </div>
      <div className={`weekly-calendar__days ${viewMode}`}>
        {daysToShow.map((day) => (
          <div
            key={day.format("YYYY-MM-DD")}
            className={`weekly-calendar__day-column ${
              isToday(day) ? "weekly-calendar__day-column--today" : ""
            }`}
          >
            <div className="weekly-calendar__day-header">
              <div className="weekly-calendar__day-name">
                {day.format("dddd DD")}
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
              {(() => {
                const dayTasks = getTasksForDay(day);
                const items = calculateDayLayout(dayTasks);

                console.log(items);

                return items.map((item, index) => {
                  if (item.type === "single") {
                    const color = item.event.color;
                    return (
                      <div
                        key={item.event.id}
                        className="weekly-calendar__task-wrapper"
                        style={{
                          top: `${item.top}px`,
                          // height: `${item.height}px`,
                          left: `${item.left}%`,
                          width: `${item.width}%`,
                          border: `2px solid  ${color ? color : "#6c7c96"}`,
                          borderRadius: "5px",
                          backgroundColor: `${color}e6`,
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                        }}
                      >
                        <TaskCard
                          task={item.event}
                          onClick={() => onTaskClick?.(item.event)}
                        />
                      </div>
                    );
                  } else {
                    const mainEvent = item.events[0];
                    const count = item.events.length;
                    const clusterId = `${day.format("YYYY-MM-DD")}-cluster-${index}`;

                    return (
                      <Popover
                        key={clusterId}
                        placement="right"
                        title={null} /* Custom header in content */
                        trigger="click"
                        open={openClusterId === clusterId}
                        onOpenChange={(visible) =>
                          setOpenClusterId(visible ? clusterId : null)
                        }
                        overlayStyle={{ padding: 0 }}
                        content={
                          <div className="weekly-calendar__popover-content">
                            <div className="weekly-calendar__popover-header">
                              <span className="weekly-calendar__popover-title-text">
                                События ({item.events.length})
                              </span>
                              <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => setOpenClusterId(null)}
                              />
                            </div>
                            <div className="weekly-calendar__popover-timeline">
                              {item.events.map((event) => (
                                <div
                                  key={event.id}
                                  className="weekly-calendar__popover-item"
                                  onClick={() => onTaskClick?.(event)}
                                >
                                  <div className="weekly-calendar__popover-time">
                                    {event.time}
                                  </div>
                                  <div className="weekly-calendar__popover-card-preview">
                                    <div
                                      style={{
                                        border: `2px solid ${event.color || "#6c7c96"}`,
                                        borderRadius: "5px",
                                        backgroundColor: event.color
                                          ? `${event.color}26`
                                          : "#6c7c9626",
                                        padding: "4px",
                                      }}
                                    >
                                      <TaskCard task={event} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                      >
                        <div
                          className="weekly-calendar__task-wrapper"
                          style={{
                            top: `${item.top}px`,
                            height: `${item.height}px`,
                            left: `${item.left}%`,
                            width: `${item.width}%`,
                            zIndex: 30,
                            cursor: "pointer",
                          }}
                        >
                          <div className="weekly-calendar__cluster-wrapper">
                            {/* Deck Effect Container */}
                            <div className="weekly-calendar__cluster-deck">
                              {/* Main Card (First Event) */}
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: "8px",
                                  border: `2px solid ${mainEvent.color || "#6c7c96"}`,
                                  backgroundColor: mainEvent.color ? `${mainEvent.color}e6` : "#6c7c96e6",
                                  overflow: "hidden",
                                  position: "relative",
                                }}
                              >
                                <TaskCard task={mainEvent} />
                              </div>
                            </div>

                            {/* "More" Indicator */}
                            <div className="weekly-calendar__more-indicator">
                              Еще {count - 1}...
                            </div>
                          </div>
                        </div>
                      </Popover>
                    );
                  }
                });
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
