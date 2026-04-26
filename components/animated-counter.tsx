"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 1500 }: Props) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;

          const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
          const suffix = value.replace(/[0-9.]/g, "");

          if (isNaN(numeric)) {
            setTimeout(() => setDisplay(value), 300);
            return;
          }

          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * numeric);
            setDisplay(`${current}${suffix}`);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}
