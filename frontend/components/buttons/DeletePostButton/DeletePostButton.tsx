"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";

export default function DeletePostButton({
  postId,
}: {
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

    const res = await fetch(`http://localhost:8000/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to delete post:", res.status);
      alert("Failed to delete post. Please try again.");
      return;
    }

    alert("Post deleted!");
    router.push("/dashboard");
  };

  return <Button text="Delete Post" link="#" onClick={handleDelete}></Button>;
}
