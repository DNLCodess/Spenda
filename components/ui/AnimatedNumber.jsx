"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

// Rolls from the previous value to the new one — gives the dashboard figures a
// deliberate, satisfying feel instead of snapping.
export default function AnimatedNumber({ value, format = (n) => Math.round(n), className }) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    from.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}
