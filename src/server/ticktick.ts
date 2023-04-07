import { differenceInCalendarDays, format, subDays } from "date-fns";
import request from "request";
import { Habit } from "../types";

const _req = request.defaults({ jar: true });

function callAPI<T = any>(path: string, method: string, json?: any) {
  return new Promise<T>((resolve, reject) => {
    _req(
      {
        method,
        url: `https://ticktick.com/api/${path}`,
        headers: {
          "Content-Type": "application/json",
          Origin: "https://ticktick.com",
        },
        json,
      },
      (error, __, response) => {
        if (error) {
          console.error(error);
          return reject(error);
        }

        if (typeof response === "string") {
          try {
            return resolve(JSON.parse(response));
          } catch (error) {
            if (error) {
              console.error(error);
              return reject(error);
            }
          }
        }

        return resolve(response);
      }
    );
  });
}

export default class TickTick {
  login({ username, password }: { username: string; password: string }) {
    return callAPI("v2/user/signon?wc=true&remember=true", "POST", {
      username,
      password,
    }).then((res) => {
      if (typeof res?.username === "undefined") {
        throw new Error("Could not login");
      }
    });
  }

  getAllUncompletedTasks() {
    return callAPI("v2/batch/check/1", "GET").then(
      (res) => res.syncTaskBean.update
    );
  }

  getCalenderEvents() {
    return callAPI("v2/calendar/bind/events/all", "GET").then(
      (res) => res.events
    );
  }

  async getTodayHabits(): Promise<Habit[]> {
    interface Checkin {
      habitId: string;
      id: string;
      opTime: string;
      status: 0 | 1 | 2;
      value: number;
    }

    const habits = await callAPI<{ id: string; name: string; goal: number }[]>(
      "v2/habits",
      "GET"
    );

    const today = new Date();

    const checkins = await callAPI<Record<string, Checkin[]>>(
      "v2/habitCheckins/query",
      "POST",
      {
        habitIds: habits.map((it) => it.id),
        afterStamp: format(subDays(new Date(), 1), "yyyy-MM-dd")
          .split("-")
          .join(""),
      }
    ).then((res) => res.checkins);

    const checkinsByHabitId = Object.values(checkins)
      .flat()
      .filter(
        (it) => differenceInCalendarDays(new Date(it.opTime), today) === 0
      )
      .reduce((acc, it) => {
        return { ...acc, [it.habitId]: it };
      }, {} as Record<string, Checkin>);

    return habits.map((habit) => {
      const checkin = checkinsByHabitId[habit.id];
      const status = checkin?.status;

      return {
        id: habit.id,
        name: habit.name,
        goal: habit.goal,
        value: checkin?.value || 0,
        status:
          typeof status === "number"
            ? status === 0
              ? "incomplete"
              : status === 1
              ? "lost"
              : status === 2
              ? "completed"
              : "incomplete"
            : "incomplete",
      };
    });
  }
}
