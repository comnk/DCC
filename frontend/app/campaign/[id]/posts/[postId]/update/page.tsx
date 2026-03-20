import UpdatePostForm from "@/components/forms/UpdatePostForm/UpdatePostForm";
import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";
import { PostParams } from "@/types/Params";

export default async function UpdatePostPage({
  params,
}: {
  params: PostParams;
}) {
  const { id, postId } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`http://localhost:8000/posts/${postId}`, {
    method: "GET",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return <div>Failed to load post data</div>;
  }

  const postData = await res.json();

  return (
    <div>
      <Navbar />
      <h2>Update Post</h2>
      <UpdatePostForm id={id} postId={postId} postData={postData} />
    </div>
  );
}
