export interface ScheduledTask {
  id: string;
  title: string;
  dueDate: string;
  type: "event" | "task";
}

export interface UnscheduledTask {
  id: string;
  title: string;
}

export interface Habit {
  id: string;
  name: string;
  goal: number;
  value: number;
  status: "incomplete" | "lost" | "completed";
}

export interface TickTickData {
  scheduled: ScheduledTask[];
  unscheduled: UnscheduledTask[];
  habits: Habit[];
}
