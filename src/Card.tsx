import { cx } from "./utils";

export default function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cx("card", title && "card--with-title")}>
      {title && <h2 className="card__title">{title}</h2>}
      {children}
    </div>
  );
}
