"use client";

import "./review.scss";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar/Navbar";
import ReviewCard from "@/components/cards/ReviewCard/ReviewCard";
import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Post } from "@/types/Post";

export default function ReviewPage() {
  const { accessToken, loading: authLoading } = useRequireAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignNames, setCampaignNames] = useState<Record<number, string>>(
    {},
  );
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!accessToken) return;

    const fetchReviewPosts = async () => {
      try {
        const [postsRes, campaignsRes] = await Promise.all([
          fetch(`${API_URL}/posts/need_review`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/campaigns/list`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        const postsData = await postsRes.json();
        const campaignsData = await campaignsRes.json();

        const campaignMap: Record<number, string> = {};
        campaignsData.forEach((c: { id: number; name: string }) => {
          campaignMap[c.id] = c.name;
        });
        setCampaignNames(campaignMap);

        setPosts(postsData);

        const uniqueAuthorIds = [
          ...new Set<string>(postsData.map((p: Post) => p.author_id)),
        ];
        const profileResults = await Promise.all(
          uniqueAuthorIds.map((id) =>
            fetch(`${API_URL}/profile/${id}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }).then((r) => r.json()),
          ),
        );

        const authorMap: Record<string, string> = {};
        profileResults.forEach((profile, i) => {
          authorMap[uniqueAuthorIds[i]] =
            profile.display_name || uniqueAuthorIds[i];
        });
        setAuthorNames(authorMap);
      } catch (err) {
        if (err instanceof Error)
          console.error("Error fetching review posts:", err);
        setError("Could not load posts for review.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewPosts();
  }, [accessToken]);

  const handleReview = async (postId: number, approved: boolean) => {
    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}/review?approved=${approved}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Review action failed");

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      if (err instanceof Error) console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  return (
    <div className="review-page">
      <Navbar />

      <main className="review-page__main">
        <div className="review-page__header">
          <div className="review-page__header-eyebrow">Content Moderation</div>
          <h1 className="review-page__title">
            Pending Review
            {!loading && posts.length > 0 && (
              <span className="review-page__count">{posts.length}</span>
            )}
          </h1>
          <p className="review-page__subtitle">
            Approve or reject posts before they go live on their scheduled date.
          </p>
        </div>

        <div className="review-page__body">
          {loading && (
            <div className="review-page__state">
              <div className="review-page__spinner" />
              <p>Loading posts…</p>
            </div>
          )}

          {!loading && error && (
            <div className="review-page__state review-page__state--error">
              <span className="review-page__state-icon">⚠</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="review-page__state review-page__state--empty">
              <span className="review-page__state-icon">✓</span>
              <p>No posts pending review.</p>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="review-page__grid">
              {posts.map((post, i) => (
                <div
                  className="review-page__card-wrapper"
                  key={post.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ReviewCard
                    postData={post}
                    campaignName={campaignNames[post.campaign_id]}
                    authorName={authorNames[post.author_id]}
                    onApprove={() => handleReview(post.id, true)}
                    onReject={() => handleReview(post.id, false)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
