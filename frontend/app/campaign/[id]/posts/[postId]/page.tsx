import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Params } from "@/types/Params";
import Link from "next/link";

export default async function PostPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

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
      <button>
        <Link href={`/campaign/${id}/posts/${postData.id}/update`}>
          Update Post
        </Link>
      </button>
      <div>
        <p>{postData.title}</p>
        <p>{postData.caption}</p>
        <p>{postData.scheduled_time}</p>
      </div>
    </div>
  );
}
