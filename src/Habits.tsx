import Card from "./Card";
import List from "./List";
import { Habit } from "./types";

export default function Habits({ items }: { items: Habit[] }) {
  return (
    <Card title="Habits">
      <List
        items={items.map((item) => ({
          title: item.name,
          subtitle: `${item.value}/${item.goal}`,
          href: `https://ticktick.com/webapp/#q/all/week/${item.id}`,
        }))}
      />
    </Card>
  );
}
