import { useRef, useState } from "react";
import { EventHoveringArg } from "@fullcalendar/core";

export interface TooltipState<T> {
  visible: boolean;
  x: number;
  y: number;
  event: T | null;
}

export function useCalendarTooltip<T>() {
  const [tooltip, setTooltip] = useState<TooltipState<T>>({
    visible: false,
    x: 0,
    y: 0,
    event: null,
  });
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEventMouseEnter = (
    arg: EventHoveringArg,
    buildEvent: (arg: EventHoveringArg) => T,
  ) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    const rect = (arg.el as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 6,
      event: buildEvent(arg),
    });
  };

  const handleEventMouseLeave = () => {
    hideTimeout.current = setTimeout(() => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  };

  const handleTooltipMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return {
    tooltip,
    handleEventMouseEnter,
    handleEventMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  };
}