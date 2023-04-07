export default function List({
  items,
}: {
  items: {
    title: React.ReactNode;
    href?: string;
    subtitle?: React.ReactNode;
  }[];
}) {
  return (
    <ul className="list">
      {items.map((item, index) => {
        const content = (
          <>
            <span className="list__item-title">{item.title}</span>
            {item.subtitle && (
              <span className="list__item-subtitle">{item.subtitle}</span>
            )}
          </>
        );

        return (
          <li key={index} className="list__item">
            {item.href ? (
              <a href={item.href} className="list__item-content">
                {content}
              </a>
            ) : (
              <div className="list__item-content">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
