import { differenceInCalendarDays, format } from "date-fns";
import Card from "./Card";
import List from "./List";
import { ScheduledTask, UnscheduledTask } from "./types";
import { api } from "./utils";

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
  requestRefresh,
}: {
  title: string;
  items: (ScheduledTask | UnscheduledTask)[];
  requestRefresh: () => void;
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
          click:
            "projectId" in item
              ? () => {
                  if (confirm("Complete?")) {
                    api("/tasks/complete", "POST", {
                      id: item.id,
                      projectId: item.projectId,
                    }).then(() => {
                      requestRefresh();
                    });
                  }
                }
              : undefined,
          href: !("projectId" in item)
            ? `https://ticktick.com/webapp/#q/all/week/${item.id}`
            : undefined,
        }))}
      />
    </Card>
  );
}
