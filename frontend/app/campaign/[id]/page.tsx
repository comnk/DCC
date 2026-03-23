import ArchiveCampaignButton from "@/components/buttons/ArchiveCampaignButton/ArchiveCampaignButton";
import Button from "@/components/buttons/Button/Button";
import DeleteCampaignButton from "@/components/buttons/DeleteCampaignButton/DeleteCampaignButton";
import PostCard from "@/components/cards/PostCard/PostCard";
import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Params } from "@/types/Params";
import { Post } from "@/types/Post";
import { redirect } from "next/navigation";

export default async function CampaignPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const token = session.access_token;

  const res = await fetch(`http://localhost:8000/campaigns/${id}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Entry fetch failed:", res.status);
  }

  const campaign = await res.json();

  const campaign_posts = await fetch(
    `http://localhost:8000/campaigns/${id}/posts`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  ).then((res) => res.json());

  return (
    <div>
      <Navbar />
      <h2>Campaign Details</h2>
      <div>
        <Button text="Create Content" link={`/campaign/${id}/posts/new`} />
        <Button text="Update Campaign" link={`/campaign/${id}/update`} />
        <DeleteCampaignButton id={id} />
        <ArchiveCampaignButton id={id} is_archived={campaign.is_archived} />
      </div>
      <hr />
      <div>
        <h2>Campaign Overview</h2>
      </div>
      <p>
        <strong>Name:</strong> {campaign.name}
      </p>
      <p>
        <strong>Description:</strong> {campaign.description}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {new Date(campaign.start_date + "T00:00:00").toLocaleDateString()}
      </p>
      <p>
        <strong>End Date:</strong>{" "}
        {new Date(campaign.end_date + "T00:00:00").toLocaleDateString()}
      </p>
      <h2>Posts</h2>
      <ul>
        {campaign_posts.map((post: Post) => (
          <PostCard key={post.id} postData={post} />
        ))}
      </ul>
    </div>
  );
}
