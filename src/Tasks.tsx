import { differenceInCalendarDays, format } from "date-fns";
import Card from "./Card";
import List from "./List";
import { ScheduledTask, UnscheduledTask } from "./types";

const today = new Date();

function DueDate({ date }: { date: Date }) {
  const diff = differenceInCalendarDays(date, today);
  const className = diff < 0 ? "past" : diff === 0 ? "today" : "later";

  return (
    <span className={`due-date due-date--${className}`}>
      {diff === -1
        ? "Yesterday"
        : diff === 0
        ? "Today"
        : diff === 1
        ? "Tomorrow"
        : format(date, "MMM d")}
    </span>
  );
}

export default function Tasks({
  title,
  items,
}: {
  title: string;
  items: (ScheduledTask | UnscheduledTask)[];
}) {
  return (
    <Card title={title}>
      <List
        items={items.map((item) => ({
          title: item.title,
          subtitle:
            "dueDate" in item ? (
              <DueDate date={new Date(item.dueDate)} />
            ) : undefined,
          href: `https://ticktick.com/webapp/#q/all/week/${item.id}`,
        }))}
      />
    </Card>
  );
}
