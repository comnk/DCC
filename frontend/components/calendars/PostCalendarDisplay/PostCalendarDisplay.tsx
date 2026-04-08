"use client";

import "./PostCalendarDisplay.scss";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventHoveringArg } from "@fullcalendar/core";

import { Post } from "@/types/Post";
import Link from "next/link";
import { TooltipState } from "@/types/ToolTipState";

export default function PostCalendarDisplay({ posts }: { posts: Post[] }) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    event: null,
  });
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const events = posts.map((post) => ({
    id: String(post.id),
    title: post.title,
    start: post.scheduled_time,
    extendedProps: {
      caption: post.caption,
      platform: post.platform,
      is_draft: post.is_draft,
      post_status: post.post_status,
      media_asset: post.media_asset,
      campaign_id: post.campaign_id,
      author_id: post.author_id,
    },
  }));

  const handleEventMouseEnter = (arg: EventHoveringArg) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    const rect = (arg.el as HTMLElement).getBoundingClientRect();

    setTooltip({
      visible: true,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 6,
      event: {
        id: arg.event.id,
        title: arg.event.title,
        caption: arg.event.extendedProps.caption,
        platform: arg.event.extendedProps.platform,
        is_draft: arg.event.extendedProps.is_draft,
        post_status: arg.event.extendedProps.post_status,
        campaign_id: arg.event.extendedProps.campaign_id,
      },
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

  return (
    <div className="calendar-display">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
      />

      {tooltip.visible && tooltip.event && (
        <div
          className="event-tooltip"
          style={{ top: tooltip.y, left: tooltip.x }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="event-tooltip__header">
            <span className="event-tooltip__title">{tooltip.event.title}</span>
            {tooltip.event.platform && (
              <span className="event-tooltip__platform">
                {tooltip.event.platform}
              </span>
            )}
          </div>

          {tooltip.event.post_status && (
            <div className="event-tooltip__row">
              <span className="event-tooltip__label">Status</span>
              <span
                className={`event-tooltip__status event-tooltip__status--${tooltip.event.post_status.toLowerCase()}`}
              >
                {tooltip.event.is_draft ? "Draft · " : ""}
                {tooltip.event.post_status}
              </span>
            </div>
          )}

          {tooltip.event.caption && (
            <div className="event-tooltip__caption">
              {tooltip.event.caption.length > 100
                ? `${tooltip.event.caption.slice(0, 100)}…`
                : tooltip.event.caption}
            </div>
          )}

          <Link
            href={`/campaign/${tooltip.event.campaign_id}/posts/${tooltip.event.id}`}
            className="event-tooltip__link"
          >
            View post details →
          </Link>
        </div>
      )}
    </div>
  );
}
