"use client";

import Navbar from "@/components/Navbar/Navbar";
import PostPreviewPanel from "@/components/PostPreviewPanel/PostPreviewPanel";
import { createClient } from "@/lib/supabase/client";
import { MediaAsset } from "@/types/MediaAsset";
import { Post } from "@/types/Post";
import { PostPreviewData } from "@/types/PostPreviewData";
import { Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PostPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<Post | null>(null);
  const [previewData, setPreviewData] = useState<PostPreviewData>({
    title: "",
    platform: [],
    caption: "",
    media_asset: [],
    scheduled_time: "",
  });

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
      setPreviewData({
        title: data.title,
        platform: data.platform,
        caption: data.caption,
        media_asset: data.media_asset.map((a: MediaAsset) => a.file_url),
        scheduled_time: data.scheduled_time,
      });
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
        <p>{postData?.platform.join(", ")}</p>
        <PostPreviewPanel data={previewData} />
      </div>
    </div>
  );
}
