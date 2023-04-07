import path from "path";
import express from "express";
import { differenceInCalendarDays, isWithinInterval } from "date-fns";
import TickTick from "./ticktick";
import { ticktick as config, credentials } from "../config.json";
import { ScheduledTask, UnscheduledTask } from "../types";

const app = express();
const tick = new TickTick();
const port = process.env.PORT || 3002;

app.use((req, res, next) => {
  const reject = () => {
    res.setHeader("www-authenticate", "Basic");
    res.sendStatus(401);
  };

  const authorization = req.headers.authorization;

  if (!authorization) {
    return reject();
  }

  const [username, password] = Buffer.from(
    authorization.replace("Basic ", ""),
    "base64"
  )
    .toString()
    .split(":");

  if (username !== credentials.username || password !== credentials.password) {
    return reject();
  }

  return next();
});

app.use(express.static(path.resolve(__dirname + "/../")));

function removeTimezone(date: string) {
  return date.split("+")[0];
}

function fixTimezone(date: string) {
  return `${removeTimezone(date)}Z`;
}

app.get("/api/data", (_, res) => {
  Promise.all([
    tick.getAllUncompletedTasks(),
    tick.getCalenderEvents(),
    tick.getTodayHabits(),
  ]).then(
    ([tasks, calendars, habits]: any) => {
      let scheduled: ScheduledTask[] = [];
      const unscheduled: UnscheduledTask[] = [];
      const today = new Date();

      tasks.forEach((it: any) => {
        if (it.status !== 0 || !config.projectIds.includes(it.projectId)) {
          return;
        }

        if (it.dueDate) {
          scheduled.push({
            id: it.id,
            title: it.title,
            dueDate: fixTimezone(it.dueDate),
            type: "task",
          });
        } else {
          unscheduled.push({
            id: it.id,
            title: it.title,
          });
        }
      });

      calendars.forEach((calendar: any) => {
        calendar.events.forEach((it: any) => {
          const startDate = new Date(removeTimezone(it.dueStart));
          const endDate = new Date(removeTimezone(it.dueEnd));

          const dueDate = isWithinInterval(today, {
            start: startDate,
            end: endDate,
          })
            ? today
            : startDate;

          scheduled.push({
            id: `${it.id}@${calendar.id}`,
            title: it.title,
            dueDate: dueDate.toISOString(),
            type: "event",
          });
        });
      });

      scheduled = scheduled.filter((it) => {
        const diff = differenceInCalendarDays(new Date(it.dueDate), today);

        if (it.type === "task") {
          return diff <= 7;
        }

        return diff >= 0 && diff <= 7;
      });

      scheduled = scheduled.sort((a, b) => {
        return differenceInCalendarDays(
          new Date(a.dueDate),
          new Date(b.dueDate)
        );
      });

      const data = { scheduled, unscheduled, habits };

      res.send(data);
    },
    () => {
      res.sendStatus(500);
    }
  );
});

tick
  .login({ username: config.username, password: config.password })
  .then(() => {
    app.listen(port, () => console.log("Server listening at port", port));
  });
