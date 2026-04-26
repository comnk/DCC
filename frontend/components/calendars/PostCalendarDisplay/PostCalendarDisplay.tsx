"use client";

import "./PostCalendarDisplay.scss";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventHoveringArg } from "@fullcalendar/core";

import { Post } from "@/types/Post";
import Link from "next/link";
import { useCalendarTooltip } from "@/hooks/useCalendarTooltip";

interface PostTooltipEvent {
  id: string;
  title: string;
  caption: string | null;
  platform: string | null;
  is_draft: boolean;
  post_status: string | null;
  campaign_id: number;
}

function parsePlatforms(
  platform: string | string[] | null | undefined,
): string[] {
  if (!platform) return [];
  if (Array.isArray(platform)) return platform;
  try {
    const cleaned = platform.replace(/'/g, '"');
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [platform];
  } catch {
    return [platform];
  }
}

function getEventColor(post: Post): {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
} {
  if (post.is_draft || !post.scheduled_time) {
    return {
      backgroundColor: "#f3f4f6",
      borderColor: "#9ca3af",
      textColor: "#374151",
    };
  }
  if (new Date(post.scheduled_time) > new Date()) {
    return {
      backgroundColor: "#dbeafe",
      borderColor: "#3b82f6",
      textColor: "#1e40af",
    };
  }
  return {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
    textColor: "#15803d",
  };
}

export default function PostCalendarDisplay({ posts }: { posts: Post[] }) {
  const {
    tooltip,
    handleEventMouseEnter,
    handleEventMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  } = useCalendarTooltip<PostTooltipEvent>();

  const events = posts.map((post) => ({
    id: String(post.id),
    title: post.title,
    start: post.scheduled_time,
    ...getEventColor(post),
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

  return (
    <div className="calendar-display">
      <div className="calendar-display__legend">
        <span className="calendar-display__legend-item calendar-display__legend-item--published">
          Published
        </span>
        <span className="calendar-display__legend-item calendar-display__legend-item--scheduled">
          Scheduled
        </span>
        <span className="calendar-display__legend-item calendar-display__legend-item--draft">
          Draft
        </span>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventMouseEnter={(arg: EventHoveringArg) =>
          handleEventMouseEnter(arg, (a) => ({
            id: a.event.id,
            title: a.event.title,
            caption: a.event.extendedProps.caption,
            platform: a.event.extendedProps.platform,
            is_draft: a.event.extendedProps.is_draft,
            post_status: a.event.extendedProps.post_status,
            campaign_id: a.event.extendedProps.campaign_id,
          }))
        }
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
            {tooltip.event.platform &&
              parsePlatforms(tooltip.event.platform).length > 0 && (
                <div className="event-tooltip__platforms">
                  {parsePlatforms(tooltip.event.platform).map((p) => (
                    <span key={p} className="event-tooltip__platform">
                      {p}
                    </span>
                  ))}
                </div>
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
