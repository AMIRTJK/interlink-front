import { Task } from "@features/tasks";

export interface EventLayout {
  type: 'single';
  event: Task;
  top: number;
  height: number;
  left: number;
  width: number;
}

export interface ClusterLayout {
  type: 'cluster';
  events: Task[];
  top: number;
  height: number;
  left: number;
  width: number;
}

export type CalendarItem = EventLayout | ClusterLayout;

const MINUTES_IN_DAY = 24 * 60;
const PIXELS_PER_MINUTE = 1.2;

const getMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const calculateDayLayout = (tasks: Task[]): CalendarItem[] => {
  if (tasks.length === 0) return [];

  const preparedEvents = tasks.map(task => {
    const start = getMinutes(task.time);
    const end = start + 60; // Фиксированная длительность 1 час
    if (end > MINUTES_IN_DAY) { /* handle day overflow if needed */ }
    return {
      task,
      start,
      end,
      duration: end - start,
    };
  }).sort((a, b) => a.start - b.start || b.duration - a.duration);

  type PreparedEvent = typeof preparedEvents[0];
  const items: CalendarItem[] = [];
  
  let currentCluster: PreparedEvent[] = [];
  let clusterEnd = -1;

  const processCluster = (cluster: PreparedEvent[]) => {
    if (cluster.length === 0) return;

    if (cluster.length <= 2) {
      cluster.forEach(event => {
        items.push({
          type: 'single',
          event: event.task,
          top: event.start * PIXELS_PER_MINUTE,
          height: event.duration * PIXELS_PER_MINUTE,
          left: 0,
          width: 100
        });
      });
    } else {
      const minStart = Math.min(...cluster.map(e => e.start));
      const maxEnd = Math.max(...cluster.map(e => e.end));
      
      items.push({
        type: 'cluster',
        events: cluster.map(e => e.task),
        top: minStart * PIXELS_PER_MINUTE,
        height: (maxEnd - minStart) * PIXELS_PER_MINUTE,
        left: 0,
        width: 100
      });
    }
  };

  for (const event of preparedEvents) {
    if (currentCluster.length === 0) {
      currentCluster.push(event);
      clusterEnd = event.end;
    } else {
      if (event.start < clusterEnd) {
        currentCluster.push(event);
        clusterEnd = Math.max(clusterEnd, event.end);
      } else {
        processCluster(currentCluster);
        currentCluster = [event];
        clusterEnd = event.end;
      }
    }
  }
  processCluster(currentCluster);

  return items;
};
