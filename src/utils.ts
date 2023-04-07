import { useEffect, useMemo, useRef } from "react";

export function cx(...args: (string | boolean | null | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait = 200
) {
  let timer: number;

  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = window.setTimeout(() => func(...args), wait);
  };
}

export default function useLatestRef<T>(callback: T) {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return ref;
}

export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T
) {
  const callbackRef = useLatestRef(callback);

  return useMemo(() => {
    return debounce((...args) => {
      callbackRef.current(...args);
    });
  }, [callbackRef]) as T;
}
