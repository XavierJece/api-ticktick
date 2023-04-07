import Card from "./Card";
import List from "./List";
import { Habit } from "./types";

export default function Habits({ items }: { items: Habit[] }) {
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
            href: `https://ticktick.com/webapp/#q/all/week/${item.id}`,
          };
        })}
      />
    </Card>
  );
}
