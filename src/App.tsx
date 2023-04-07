import { useEffect, useState } from "react";
import { TickTickData } from "./types";
import Clock from "./Clock";
import Habits from "./Habits";
import Tasks from "./Tasks";
import Links from "./Links";
import MasonryLayout from "./MasonryLayout";

export default function App() {
  const [data, setData] = useState<TickTickData>();

  useEffect(() => {
    const dataCache: { cachedAt: number; data: TickTickData } | undefined =
      (() => {
        try {
          //@ts-expect-error
          return JSON.parse(localStorage.getItem("ticktick"));
        } catch (_) {
          return undefined;
        }
      })();

    if (dataCache) {
      setData(dataCache.data);
    }

    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(
          "ticktick",
          JSON.stringify({ cachedAt: Date.now(), data })
        );

        setData(data);
      });
  }, []);

  return (
    <div className="app">
      <MasonryLayout>
        <Clock />
        <Tasks title="Today and Upcoming" items={data?.scheduled || []} />
        <Links />
        <Habits items={data?.habits || []} />
        <Tasks title="Unscheduled" items={data?.unscheduled || []} />
      </MasonryLayout>
    </div>
  );
}
