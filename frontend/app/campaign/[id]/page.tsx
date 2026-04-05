import "./campaign_page.scss";

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token = session.access_token;

  const res = await fetch(`${API_URL}/campaigns/${id}`, {
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
    <div className="campaign-page">
      <Navbar />
      <div className="campaign-page__content">
        <div className="campaign-page__header">
          <h2 className="campaign-page__title">Campaign Details</h2>
          <div className="campaign-page__actions">
            <Button text="Create Content" link={`/campaign/${id}/posts/new`} />
            <Button text="Update Campaign" link={`/campaign/${id}/update`} />
            <DeleteCampaignButton id={id} />
            <ArchiveCampaignButton id={id} is_archived={campaign.is_archived} />
          </div>
        </div>

        <section className="campaign-overview">
          <h2 className="campaign-overview__title">Campaign Overview</h2>
          <div className="campaign-overview__fields">
            <div className="campaign-overview__field">
              <span className="campaign-overview__label">Name</span>
              <span className="campaign-overview__value">{campaign.name}</span>
            </div>
            <div className="campaign-overview__field">
              <span className="campaign-overview__label">Description</span>
              <span className="campaign-overview__value">
                {campaign.description}
              </span>
            </div>
            <div className="campaign-overview__field">
              <span className="campaign-overview__label">Start Date</span>
              <span className="campaign-overview__value">
                {new Date(campaign.start_date + "T00:00:00").toLocaleDateString(
                  "en-US",
                )}
              </span>
            </div>
            <div className="campaign-overview__field">
              <span className="campaign-overview__label">End Date</span>
              <span className="campaign-overview__value">
                {new Date(campaign.end_date + "T00:00:00").toLocaleDateString(
                  "en-US",
                )}
              </span>
            </div>
          </div>
        </section>

        <section className="campaign-posts">
          <h2 className="campaign-posts__title">Posts</h2>
          <ul className="campaign-posts__list">
            {campaign_posts.map((post: Post) => (
              <li key={post.id}>
                <PostCard postData={post} searchTerm="" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
