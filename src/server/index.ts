import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { differenceInCalendarDays, isWithinInterval } from "date-fns";
import TickTick from "./ticktick";
import { ticktick as config } from "../config.json";
import { ScheduledTask, UnscheduledTask } from "../types";
import setupAuth from "./setupAuth";
import routesV2 from "../api/v2/routes";

const app = express();
const tick = new TickTick();
const port = process.env.PORT || 3002;

app.use(bodyParser.json());

app.use(routesV2);


app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));



// setupAuth(app);

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
            projectId: it.projectId,
            title: it.title,
            dueDate: fixTimezone(it.dueDate),
            type: "task",
          });
        } else {
          unscheduled.push({
            id: it.id,
            title: it.title,
            projectId: it.projectId,
            type: "task",
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
    (error) => {
      res.status(500).send({ error });
    }
  );
});

app.post("/api/habits/checkin", (req, res) => {
  tick.checkinHabit(req.body.habitId).then(
    () => res.send({ success: true }),
    (error) => res.status(500).send({ error })
  );
});

app.post("/api/tasks/complete", (req, res) => {
  tick.completeTask(req.body.id, req.body.projectId).then(
    () => res.send({ success: true }),
    (error) => res.status(500).send({ error })
  );
});

app.listen(port, () => console.log("Server listening at port", port));

