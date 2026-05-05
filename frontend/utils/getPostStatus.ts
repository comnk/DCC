import { Post } from "@/types/Post";
import { PostStatus } from "@/types/PostStatus";

export function getPostStatus(post: Post): PostStatus {
  if (post.post_status) {
    const s = post.post_status.toLowerCase();
    if (s === "draft") return "draft";
    if (s === "in_review" || s === "in review") return "in_review"; // ← must be here
    if (s === "approved") return "approved";
    if (s === "scheduled") return "scheduled";
    if (s === "rejected") return "rejected";
    if (s === "posted" || s === "published") return "posted";
    if (s === "publishing") return "publishing";
    if (s === "failed") return "failed";
  }
  if (post.is_draft) return "draft";
  if (post.scheduled_time && new Date(post.scheduled_time) > new Date())
    return "scheduled";
  return "posted";
}