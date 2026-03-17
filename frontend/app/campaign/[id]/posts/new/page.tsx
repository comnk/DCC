import NewPostForm from "@/components/forms/NewPostForm/NewPostForm";
import Navbar from "@/components/Navbar/Navbar";

type Params = Promise<{ id: string }>;

export default async function NewPostPage({ params }: { params: Params }) {
  const { id } = await params;

  return (
    <div>
      <Navbar />
      <h2>Create New Post</h2>
      <NewPostForm campaignId={id} />
    </div>
  );
}
