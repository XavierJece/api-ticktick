import { Children, useCallback, useEffect, useRef, useState } from "react";
//@ts-expect-error
import Macy from "macy";
import { useDebouncedCallback } from "./utils";
import { cx } from "./utils";

const gutter = 32;
const smallerColumnWidth = 300;
const largerColumnWidth = 600;

function MasonryLayoutItem({
  children,
  onSizeChange,
}: {
  children: React.ReactNode;
  onSizeChange: () => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const onSizeChangeRef = useRef<() => void>(onSizeChange);

  useEffect(() => {
    onSizeChangeRef.current = onSizeChange;
  }, [onSizeChange]);

  useEffect(() => {
    const node = nodeRef.current;

    if (!node) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      onSizeChangeRef.current();
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.observe(node);
    };
  }, []);

  return (
    <div className="masonry-layout__item" ref={nodeRef}>
      {children}
    </div>
  );
}

export default function MasonryLayout({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const macyRef = useRef<any>();
  const nodeRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const items = [...Children.toArray(children)].flat().filter(Boolean);

  const getColumnCount = useCallback(() => {
    const availableWidth = nodeRef.current?.offsetWidth || 0;
    const columnWidth =
      window.innerWidth < 700 ? smallerColumnWidth : largerColumnWidth;

    const columnCount = Math.max(
      1,
      Math.floor(availableWidth / (columnWidth + gutter))
    );

    return columnCount;
  }, []);

  const recalculateMacy = useCallback(() => {
    if (macyRef.current) {
      macyRef.current.options.columns = getColumnCount();
      macyRef.current.recalculate(true);
    }
  }, [getColumnCount]);

  const onResize = useDebouncedCallback(recalculateMacy);

  useEffect(() => {
    let readyTimeout: number;

    macyRef.current = Macy({
      container: nodeRef.current!,
      columns: getColumnCount(),
    });

    readyTimeout = window.setTimeout(() => {
      document.body.classList.add("ready");
      setReady(true);
    }, 100);

    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(readyTimeout);
      window.removeEventListener("resize", onResize);
    };
    //eslint-disable-next-line
  }, []);

  return (
    <div
      style={{ opacity: ready ? 1 : 0 }}
      className={cx("masonry-layout", className)}
    >
      <div ref={nodeRef}>
        {items.map((item, index) => (
          <MasonryLayoutItem key={index} onSizeChange={recalculateMacy}>
            {item}
          </MasonryLayoutItem>
        ))}
      </div>
    </div>
  );
}
