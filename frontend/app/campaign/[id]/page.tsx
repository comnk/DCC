import "./campaign_page.scss";

import ArchiveCampaignButton from "@/components/buttons/ArchiveCampaignButton/ArchiveCampaignButton";
import Button from "@/components/buttons/Button/Button";
import DeleteCampaignButton from "@/components/buttons/DeleteCampaignButton/DeleteCampaignButton";
import CampaignTeam from "@/components/CampaignTeam/CampaignTeam";
import PostCard from "@/components/cards/PostCard/PostCard";
import Navbar from "@/components/Navbar/Navbar";
import { getServerAuth, apiRequest } from "@/lib/api/server";
import { Params } from "@/types/Params";
import { Post } from "@/types/Post";
import { Campaign } from "@/types/Campaign";
import { User } from "@/types/User";
import { redirect } from "next/navigation";

export default async function CampaignPage({ params }: { params: Params }) {
  const { id } = await params;

  const { token, user } = await getServerAuth();

  if (!token || !user) {
    redirect("/login");
  }

  let campaign: Campaign;
  try {
    campaign = await apiRequest<Campaign>(`/campaigns/${id}`, token, {
      cache: "no-store",
    });
  } catch (err) {
    console.error("Entry fetch failed:", err);
    throw err;
  }
  const isOwner = campaign.created_by === user.id;

  let campaign_posts: Post[] = [];
  try {
    campaign_posts = await apiRequest<Post[]>(`/campaigns/${id}/posts`, token, {
      cache: "no-store",
    });
  } catch {
    // preserves prior "degrade to []" behavior
  }

  let creatorProfile: User | null = null;
  try {
    creatorProfile = await apiRequest<User>(`/profile/${user.id}`, token, {
      cache: "no-store",
    });
  } catch {
    // preserves prior "degrade to null" behavior
  }

  const creator = {
    id: user.id,
    display_name: creatorProfile?.display_name ?? user.email ?? "Creator",
    role: creatorProfile?.role ?? "Admin",
    profile_picture: creatorProfile?.profile_picture ?? null,
    email: user.email ?? "",
  };

  let taskSummary: Record<number, { total: number; done: number }> = {};
  try {
    taskSummary = await apiRequest(`/campaigns/${id}/task-summary`, token, {
      cache: "no-store",
    });
  } catch {
    // preserves prior "degrade to {}" behavior
  }

  return (
    <div className="campaign-page">
      <Navbar />
      <div className="campaign-page__content">
        <div className="campaign-page__header">
          <h2 className="campaign-page__title">Campaign Details</h2>
          <div className="campaign-page__actions">
            <Button text="Create Content" link={`/campaign/${id}/posts/new`} />
            {isOwner && (
              <>
                <Button
                  text="Update Campaign"
                  link={`/campaign/${id}/update`}
                />
                <DeleteCampaignButton id={id} />
                <ArchiveCampaignButton
                  id={id}
                  is_archived={campaign.is_archived}
                />
              </>
            )}
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
                <PostCard
                  postData={post}
                  searchTerm=""
                  taskSummary={taskSummary[post.id]}
                />
              </li>
            ))}
          </ul>
        </section>
        <CampaignTeam creator={creator} campaignId={id} accessToken={token} />
      </div>
    </div>
  );
}
