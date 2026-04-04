"use client";

import "./PostCard.scss";

import { Post } from "@/types/Post";
import { CheckCircle, EditNote, Schedule } from "@mui/icons-material";
import { Chip } from "@mui/material";
import Link from "next/link";

type Tab = "published" | "scheduled" | "draft";

function getPostStatus(post: Post): Tab {
  if (post.is_draft) return "draft";
  if (post.scheduled_time && new Date(post.scheduled_time) > new Date())
    return "scheduled";
  return "published";
}

function PostStatusBadge({ post }: { post: Post }) {
  const status = getPostStatus(post);

  if (status === "draft") {
    return (
      <Chip
        icon={<EditNote fontSize="small" />}
        label="Draft"
        size="small"
        color="default"
        variant="outlined"
      />
    );
  }

  if (status === "scheduled") {
    return (
      <Chip
        icon={<Schedule fontSize="small" />}
        label={`Scheduled · ${new Date(post.scheduled_time!).toLocaleDateString(
          "en-US",
        )}`}
        size="small"
        color="warning"
        variant="outlined"
      />
    );
  }

  return (
    <Chip
      icon={<CheckCircle fontSize="small" />}
      label={
        post.scheduled_time
          ? `Published · ${new Date(post.scheduled_time).toLocaleDateString("en-US")}`
          : "Published"
      }
      size="small"
      color="success"
      variant="outlined"
    />
  );
}

export default function PostCard({ postData }: { postData: Post }) {
  return (
    <div className="post-card">
      <PostStatusBadge post={postData} />
      <div className="post-card__body">
        <Link
          href={`/campaign/${postData.campaign_id}/posts/${postData.id}`}
          className="post-card__title"
        >
          {postData.title}
        </Link>
        <p className="post-card__caption">{postData.caption}</p>
      </div>
    </div>
  );
}
