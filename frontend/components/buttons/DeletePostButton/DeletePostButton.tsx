"use client";

import { createClient } from "@/lib/supabase/client";
import { apiRequest } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";

export default function DeletePostButton({
  campaignId,
  postId,
}: {
  campaignId: string;
  postId: number | undefined;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      alert("You must be logged in to delete a post");
      router.push("/login");
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) {
      return;
    }

    try {
      await apiRequest(`/posts/${postId}`, data.session.access_token, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
      return;
    }

    alert("Post deleted!");
    router.push(`/campaign/${campaignId}`);
  };

  return <Button text="Delete Post" link="#" onClick={handleDelete}></Button>;
}
