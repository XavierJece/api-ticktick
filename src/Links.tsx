import Card from "./Card";
import { links } from "./config.json";

export default function Links() {
  return (
    <Card>
      <ul className="links">
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.url} target="_parent">
              <img src={link.icon} />
              <span>{link.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
