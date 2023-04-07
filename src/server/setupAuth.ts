import { Express } from "express";
import jwt from "jsonwebtoken";
import { credentials } from "../config.json";

export default function setupAuth(app: Express) {
  app.get("/login", (_, res) => {
    res.send(`
      <html>
        <body>
          <form method="post" action="/login">
            <input name="username" />
            <input name="password" type="password" />
            <button type="submit">login</button>
          </form>
        </body>
      </html>
    `);
  });

  app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const secure = req.headers.origin?.startsWith("https://") || false;

    if (
      username !== credentials.username ||
      password !== credentials.password
    ) {
      return res.sendStatus(401);
    }

    const token = jwt.sign({ username }, credentials.jwtSecret);

    return res
      .cookie("access_token", token, {
        expires: new Date(253402300000000),
        httpOnly: true,
        secure,
      })
      .sendStatus(200);
  });

  app.use((req, res, next) => {
    const token = req.cookies.access_token;

    if (token) {
      try {
        const data = jwt.verify(token, credentials.jwtSecret) as {
          username: string;
        };

        if (data.username === credentials.username) {
          return next();
        }
      } catch {}
    }

    return res.sendStatus(403);
  });
}
