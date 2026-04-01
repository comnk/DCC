import "./new_post_page.scss";

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
    <div className="new-post-page">
      <Navbar />
      <div className="new-post-page__content">
        <h1 className="new-post-page__title">Create New Post</h1>
        <NewPostPageClient campaignId={id} />
      </div>
    </div>
  );
}
