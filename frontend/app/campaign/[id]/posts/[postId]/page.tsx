import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

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
      <h1>Post Details</h1>
      <p>{postData.title}</p>
      <p>{postData.caption}</p>
      <p>{postData.scheduled_time}</p>
    </div>
  );
}
