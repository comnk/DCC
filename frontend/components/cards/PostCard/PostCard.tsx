import { Post } from "@/types/Post";
import Link from "next/link";

export default function PostCard({ postData }: { postData: Post }) {
  return (
    <div>
      <Link href={`/campaign/${postData.id}/posts/${postData.id}`}>
        <strong>{postData.title}</strong>
      </Link>
      <p>{postData.caption}</p>
    </div>
  );
}
