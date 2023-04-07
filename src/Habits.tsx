import Card from "./Card";
import List from "./List";
import { Habit } from "./types";
import { api } from "./utils";

export default function Habits({
  items,
  requestRefresh,
}: {
  items: Habit[];
  requestRefresh: () => void;
}) {
  return (
    <Card title="Habits">
      <List
        items={items.map((item) => {
          const stauts =
            item.value >= item.goal
              ? "done"
              : item.value === 0
              ? "zeroed"
              : "partial";

          return {
            title: item.name,
            subtitle: (
              <span
                className={`habit--${stauts}`}
              >{`${item.value}/${item.goal}`}</span>
            ),
            click: () => {
              if (confirm("Check In?")) {
                api("/habits/checkin", "POST", {
                  habitId: item.habitId,
                }).then(() => {
                  requestRefresh();
                });
              }
            },
          };
        })}
      />
    </Card>
  );
}
