import { Post } from "@/types/Post";
import { Chip } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import "./PostStatusBadge.scss";

type PostStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "scheduled"
  | "posted"
  | "rejected";

function getPostStatus(post: Post): PostStatus {
  if (post.post_status) {
    const s = post.post_status.toLowerCase();
    if (s === "draft") return "draft";
    if (s === "in_review" || s === "in review") return "in_review";
    if (s === "approved") return "approved";
    if (s === "scheduled") return "scheduled";
    if (s === "rejected") return "rejected";
    if (s === "posted" || s === "published") return "posted";
  }
  if (post.is_draft) return "draft";
  if (post.scheduled_time && new Date(post.scheduled_time) > new Date())
    return "scheduled";
  return "posted";
}

const STATUS_CONFIG: Record<
  PostStatus,
  {
    label: string;
    dotColor: string;
    borderColor: string;
    textColor: string;
    blink: boolean;
  }
> = {
  draft: {
    label: "Draft",
    dotColor: "#9ca3af",
    borderColor: "#d1d5db",
    textColor: "#374151",
    blink: false,
  },
  in_review: {
    label: "In Review",
    dotColor: "#f97316",
    borderColor: "#fed7aa",
    textColor: "#9a3412",
    blink: true,
  },
  approved: {
    label: "Approved",
    dotColor: "#22c55e",
    borderColor: "#bbf7d0",
    textColor: "#15803d",
    blink: true,
  },
  scheduled: {
    label: "Scheduled",
    dotColor: "#60a5fa",
    borderColor: "#bfdbfe",
    textColor: "#1e40af",
    blink: true,
  },
  posted: {
    label: "Posted",
    dotColor: "#a78bfa",
    borderColor: "#ddd6fe",
    textColor: "#6d28d9",
    blink: false,
  },
  rejected: {
    label: "Rejected",
    dotColor: "#ef4444",
    borderColor: "#fecaca",
    textColor: "#991b1b",
    blink: false,
  },
};

export function PostStatusBadge({ post }: { post: Post }) {
  const status = getPostStatus(post);
  const { label, dotColor, borderColor, textColor, blink } =
    STATUS_CONFIG[status];

  return (
    <Chip
      icon={
        <span className={`status-dot ${blink ? "status-dot--blink" : ""}`}>
          <FiberManualRecordIcon style={{ color: dotColor, fontSize: 14 }} />
        </span>
      }
      label={label}
      size="small"
      variant="outlined"
      style={{
        borderColor,
        color: textColor,
        fontWeight: 600,
        backgroundColor: "transparent",
      }}
    />
  );
}
