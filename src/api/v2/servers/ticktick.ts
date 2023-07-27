import axios from "axios";
import { ticktick } from "../../../config.json";

const api = axios.create({
  baseURL: "https://api.ticktick.com/api",
})

class TickTick {
  async login(username: string, password: string): Promise<string> {
    console.log(username, password, ticktick.appInformation["X-Device"]);

    const response = await api.post(
      "v2/user/signon?wc=true&remember=true",
      { username, password },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Device": JSON.stringify(ticktick.appInformation["X-Device"]),
        },
      }
    );

    if (!response.data.token) {
      throw new Error(`Could not login | ${response.data}`);
    }

    return response.data.token;
  }

  getAllUncompletedTasks() {}

  getTodayHabits() {}

  checkinHabit() {}

  completeTask() {}
}

export const ticktickServer = new TickTick();
