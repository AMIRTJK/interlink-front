import { useState } from "react";
import { Modal } from "antd";
import { WeeklyCalendar } from "@features/calendar";
import { AddTaskForm } from "@features/tasks";
import type { Task, TaskFormValues } from "@features/tasks";
import dayjs, { Dayjs } from "dayjs";
import "./styles.css";

// Sample tasks for demonstration
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Наблюдение за новыми проектами",
    date: "2024-12-09",
    time: "08:30",
    endTime: "10:00",
    category: "work",
    participants: [
      { id: "1", name: "Иван", avatar: "https://i.pravatar.cc/150?img=1" },
      { id: "2", name: "Мария", avatar: "https://i.pravatar.cc/150?img=2" },
    ],
  },
  {
    id: "2",
    title: "Астрофотография",
    date: "2024-12-11",
    time: "17:00",
    category: "personal",
    participants: [
      { id: "3", name: "Петр", avatar: "https://i.pravatar.cc/150?img=3" },
    ],
  },
  {
    id: "3",
    title: "Промежуточные телескопы",
    date: "2024-12-12",
    time: "14:00",
    endTime: "14:00",
    category: "meeting",
    participants: [
      { id: "4", name: "Анна", avatar: "https://i.pravatar.cc/150?img=4" },
      { id: "5", name: "Сергей", avatar: "https://i.pravatar.cc/150?img=5" },
    ],
  },
  {
    id: "4",
    title: "Солнечная система",
    date: "2024-12-13",
    time: "11:00",
    category: "important",
    participants: [
      { id: "6", name: "Елена", avatar: "https://i.pravatar.cc/150?img=6" },
      { id: "7", name: "Дмитрий", avatar: "https://i.pravatar.cc/150?img=7" },
    ],
  },
  {
    id: "5",
    title: "Желтенький цикл звезд",
    date: "2024-12-14",
    time: "09:00",
    endTime: "12:00",
    category: "work",
    participants: [
      { id: "8", name: "Ольга", avatar: "https://i.pravatar.cc/150?img=8" },
    ],
  },
  {
    id: "6",
    title: "Космос для начинающих",
    date: "2024-12-15",
    time: "16:00",
    category: "meeting",
    participants: [
      { id: "9", name: "Алексей", avatar: "https://i.pravatar.cc/150?img=9" },
      { id: "10", name: "Наталья", avatar: "https://i.pravatar.cc/150?img=10" },
    ],
  },
];

export const CalendarPage = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
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

  const handleTaskCreated = (values: TaskFormValues) => {
    const newTask: Task = {
      id: String(Date.now()),
      title: values.title,
      date: values.date?.format("YYYY-MM-DD") || "",
      time: values.time?.format("HH:mm") || "",
      category: "work",
    };

    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
    setSelectedDateTime(null);
  };

  return (
    <div className="profile-page">
      <div className="calendar-page-container">
        <WeeklyCalendar 
          tasks={tasks} 
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
            initialValues={selectedDateTime || undefined}
            onSuccess={handleTaskCreated}
          />
        </Modal>
      </div>
    </div>
  );
};
