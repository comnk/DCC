"use client";

import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/Post";
import { Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const router = useRouter();
  const [postData, setPostData] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const res = await fetch(`http://localhost:8000/posts/${postId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        router.push(`/campaign/${id}/posts`);
        return;
      }

      const data = await res.json();
      setPostData(data);
      setLoading(false);
    };

    fetchPost();
  }, [postId, router, id]);

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Navbar />
      <h2>Post Details</h2>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        href={`/campaign/${id}/posts/${postData?.id}/update`}
      >
        Update Post
      </Button>
      <div>
        <p>{postData?.title}</p>
        <p>{postData?.caption}</p>
        <p>{postData?.scheduled_time}</p>
      </div>
    </div>
  );
}
