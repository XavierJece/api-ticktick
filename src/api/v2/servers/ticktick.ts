import axios from "axios";
import dayjs from "dayjs";
import { ticktick } from "../../../config.json";

const api = axios.create({
  baseURL: "https://api.ticktick.com/api",
  headers: {
    "Content-Type": "application/json",
    "X-device": JSON.stringify(ticktick.appInformation["X-Device"]),
    cookie: `t=${ticktick.token}`,
  },
});

interface IHabitCheckin {
  habitId: string;
  id: string;
  opTime: string;
  status: 0 | 1 | 2;
  value: number;
  checkinStamp: string;
  checkinTime: string;
  goal: 1;
}

interface IHabit {
  id: string;
  name: string;
  status: number;
  encouragement: string;
  totalCheckIns: number;
  type: string;
  goal: number;
  step: number;
  unit: string;
  repeatRule: string;
  reminders: string[];
  repeat: {
    freq: string;
    interval?: number;
    byDays: string[];
  };
}

class TickTick {
  async login(username: string, password: string): Promise<string> {
    const response = await api.post("v2/user/signon?wc=true&remember=true", {
      username,
      password,
    });

    if (!response.data.token) {
      throw new Error(`Could not login | ${response.data}`);
    }

    return response.data.token;
  }

  async getAllUncompletedTasks() {
    const response = await api.get("v2/batch/check/1");

    return response.data;
  }

  async getCalenderEvents() {
    const response = await api.get("v2/calendar/bind/events/all");

    return response.data;
  }

  private async getAllHabits(): Promise<IHabit[]> {
    type HabitAPIResponse = Omit<IHabit, "repeat">;

    const response = await api.get<HabitAPIResponse[]>("v2/habits");

    return response.data.map((habit: HabitAPIResponse) => {
      const repeatRule = habit.repeatRule.split(";");

      let repeat = {} as IHabit["repeat"];

      if (repeatRule.length === 3) {
        repeat = {
          freq: repeatRule[0].split("=")[1],
          interval: Number(repeatRule[1].split("=")[1]),
          byDays: repeatRule[2].split("=")[1].split(","),
        };
      } else if (repeatRule.length === 2) {
        repeat = {
          freq: repeatRule[0].split("=")[1],
          byDays: repeatRule[1].split("=")[1].split(","),
        };
      }

      return {
        id: habit.id,
        name: habit.name,
        status: habit.status,
        encouragement: habit.encouragement,
        totalCheckIns: habit.totalCheckIns,
        type: habit.type,
        goal: habit.goal,
        step: habit.step,
        unit: habit.unit,
        repeatRule: habit.repeatRule,
        reminders: habit.reminders,
        repeat,
      };
    });
  }

  private async getHabitsCheckins(
    habitIds: string[],
    afterStamp: string
  ): Promise<Record<string, IHabitCheckin[]>> {
    const response = await api.post("v2/habitCheckins/query", {
      habitIds,
      afterStamp,
    });

    return response.data.checkins;
  }

  async getTodayHabits(
    query: {
      completed?: boolean;
      uncompleted?: boolean;
    } = { uncompleted: true }
  ): Promise<IHabit[]> {
    const habits = await this.getAllHabits();

    const today = dayjs();
    const weekDayToday = dayjs(today).format("dd").toUpperCase();

    console.log(weekDayToday);

    const todayHabits = habits.filter((habit) =>
      habit.repeat.byDays.includes(weekDayToday)
    );

    //add filters
    if (query) {
      const idsTodayHabits = todayHabits.map((habit) => habit.id);
      const afterStamp = this.toTickTickStamp(today.subtract(1, "day"));

      console.log({ idsTodayHabits, afterStamp });

      const checkinHabit = await this.getHabitsCheckins(
        idsTodayHabits,
        afterStamp
      );

      // Habit with status 0 is uncompleted and 2 is completed
      const idsCompletedHabits = Object.values(checkinHabit)
        .flat()
        .filter((checkedHabit) => checkedHabit.status !== 0)
        .map(({ habitId }) => habitId);

      if (query.completed) {
        return todayHabits.filter((habit) =>
          idsCompletedHabits.includes(habit.id)
        );
      } else if (query.uncompleted) {
        return todayHabits.filter(
          (habit) => !idsCompletedHabits.includes(habit.id)
        );
      }
    }

    return todayHabits;
  }

  async checkinHabit(id: string) {
    const today = dayjs();
    const afterStamp = this.toTickTickStamp(today.subtract(1, "day"));
    const todayStamp = this.toTickTickStamp(today);

    const habitsCheckins = await this.getHabitsCheckins([id], afterStamp);
    const checkin =
      habitsCheckins[id].length > 0 ? habitsCheckins[id][0] : undefined;

    console.log("habitsCheckins: ", habitsCheckins);
    console.log("checkin: ", checkin);

    let payload: Record<"add" | "update" | "delete", IHabitCheckin[]> = {
      add: [],
      update: [],
      delete: [],
    };

    if (!checkin) {
      // const checkData: ICheckHabitParams = {}
      // payload.add.push(checkData);
    } else if (checkin.status === 2) {
      // Habit with status 0 is uncompleted and 2 is completed
      return {
        checked: false,
        message: "Habit already concluded today",
      };
    } else {
      const { value, goal } = checkin;
      const newValue = value + 1;
      const newStatus = newValue === goal ? 2 : 0;

      const checkData: IHabitCheckin = {
        ...checkin,
        value: value + 1,
        status: newStatus,
        checkinStamp: todayStamp,
        checkinTime: this.toISO8601(today),
        opTime: this.toISO8601(today),
      };

      payload.update.push(checkData);
    }

    console.log("payload", payload);

    try {
      const response = await api.post<Record<string, Object>>(
        "v2/habitCheckins/batch",
        payload
      );

      console.log("BATATA", response.data);
    } catch (error) {
      console.log("ERROR", error);
    }

    return true;
  }

  completeTask() {}

  // utils
  private toTickTickStamp(date: Date | dayjs.Dayjs): string {
    return dayjs(date).format("YYYYMMDD");
  }

  private toISO8601(date: Date | dayjs.Dayjs): string {
    return dayjs(date).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  }
}

export const ticktickServer = new TickTick();
