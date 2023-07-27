import axios from "axios";
import { differenceInCalendarDays, subDays } from "date-fns";
import dayjs from 'dayjs'
import { ticktick } from "../../../config.json";
import en from 'date-fns/locale/en-US';

const api = axios.create({
  baseURL: "https://api.ticktick.com/api",
  headers: {
    "Content-Type": "application/json",
    "X-Device": JSON.stringify(ticktick.appInformation["X-Device"]),
    "Cookie": `t=${ticktick.token}`
  }
})

interface IHabitCheckin {
  habitId: string;
  id: string;
  opTime: string;
  status: 0 | 1 | 2;
  value: number;
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
  }
}




class TickTick {
  async login(username: string, password: string): Promise<string> {
    const response = await api.post(
      "v2/user/signon?wc=true&remember=true",
      { username, password },
    );

    if (!response.data.token) {
      throw new Error(`Could not login | ${response.data}`);
    }

    return response.data.token;
  }

  async getAllUncompletedTasks() {
    const response = await api.get("v2/batch/check/1")
    

    return response.data
  }

  async getCalenderEvents() {
    const response = await api.get("v2/calendar/bind/events/all")
    
    return response.data
  }

  private async getAllHabits(): Promise<IHabit[]> {
    type HabitAPIResponse = Omit<IHabit, 'repeat'>

    const response = await api.get<HabitAPIResponse[]>("v2/habits");
    
    return response.data.map((habit: HabitAPIResponse) => {
      const repeatRule = habit.repeatRule.split(";")

      let repeat = {} as IHabit['repeat']

      if(repeatRule.length === 3) {
        repeat = {
          freq: repeatRule[0].split("=")[1],
          interval: Number(repeatRule[1].split("=")[1]),
          byDays: repeatRule[2].split("=")[1].split(','),
        }
      }else if(repeatRule.length === 2) {
        repeat = {
          freq: repeatRule[0].split("=")[1],
          byDays: repeatRule[1].split("=")[1].split(','),
        }
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
      }
    })
  }


  private async getHabitsCheckins(habitIds: string[], afterStamp: string): Promise<IHabitCheckin[]> {
    const response = await api.post("v2/habitCheckins/query", {
      habitIds, afterStamp
    })
    
    return response.data.checkins
  }


  async getTodayHabits() {
    const habits = await this.getAllHabits()

    const today = new Date();
    const weekDayToday = dayjs(today).format('dd').toUpperCase()
    
    console.log(weekDayToday)

    const todayHabits = habits.filter((habit) => habit.repeat.byDays.includes(weekDayToday))


    return todayHabits;
  }

  checkinHabit() {}

  completeTask() {}

  // utils
  private convertDateToTickTickStamp(date: Date): string {
    return dayjs(date).format("yyyy-MM-dd").split("-").join("");
  }
}

export const ticktickServer = new TickTick();
