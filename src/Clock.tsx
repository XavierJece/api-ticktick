import { useEffect, useState } from "react";
import Card from "./Card";

function getTime() {
  const now = new Date();
  const hours = ("0" + now.getHours()).slice(-2);
  const minutes = ("0" + now.getMinutes()).slice(-2);

  return `${hours}:${minutes}`;
}

export default function Clock() {
  const [time, setTime] = useState(getTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTime);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Card>
      <div className="clock">{time}</div>
    </Card>
  );
}
