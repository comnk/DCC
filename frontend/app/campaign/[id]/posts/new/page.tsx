import NewPostForm from "@/components/forms/NewPostForm/NewPostForm";
import Navbar from "@/components/Navbar/Navbar";
import PostPreviewPanel from "@/components/PostPreviewPanel/PostPreviewPanel";
import { Params } from "@/types/Params";

export default async function NewPostPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <div>
      <Navbar />
      <h2>Create New Post</h2>
      <NewPostForm campaignId={id} />
      <PostPreviewPanel />
    </div>
  );
}
