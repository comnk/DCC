import NewPostPageClient from "@/components/NewPostPageClient/NewPostPageClient";
import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Params } from "@/types/Params";
import { redirect } from "next/navigation";

export default async function NewPostPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <Navbar />
      <h2>Create New Post</h2>
      <NewPostPageClient campaignId={id} />
    </div>
  );
}
