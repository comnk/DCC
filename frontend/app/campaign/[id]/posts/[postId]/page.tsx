import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Params } from "@/types/Params";
import { Button } from "@mui/material";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PostPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const token = session.access_token;

  const res = await fetch(`http://localhost:8000/posts/${id}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const postData = await res.json();

  return (
    <div>
      <Navbar />
      <h2>Post Details</h2>
      <Button variant="contained" color="primary">
        <Link href={`/campaign/${id}/posts/${postData.id}/update`}>
          Update Post
        </Link>
      </Button>
      <div>
        <p>{postData.title}</p>
        <p>{postData.caption}</p>
        <p>{postData.scheduled_time}</p>
      </div>
    </div>
  );
}
