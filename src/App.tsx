import { useEffect, useState } from "react";
import { TickTickData } from "./types";
import Clock from "./Clock";
import Habits from "./Habits";
import Tasks from "./Tasks";
import Links from "./Links";
import MasonryLayout from "./MasonryLayout";
import { api } from "./utils";

export default function App() {
  const [data, setData] = useState<TickTickData>();

  function refresh() {
    api("/data", "GET").then((data) => {
      localStorage.setItem(
        "ticktick",
        JSON.stringify({ cachedAt: Date.now(), data })
      );

      setData(data);
    });
  }

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

    refresh();
  }, []);

  return (
    <div className="app">
      <MasonryLayout>
        <Clock />
        <Tasks
          title="Today and Upcoming"
          items={data?.scheduled || []}
          requestRefresh={refresh}
        />
        <Links />
        <Habits items={data?.habits || []} requestRefresh={refresh} />
        <Tasks
          title="Unscheduled"
          items={data?.unscheduled || []}
          requestRefresh={refresh}
        />
      </MasonryLayout>
    </div>
  );
}
