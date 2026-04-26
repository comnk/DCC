"use client";

import { useState } from "react";
import Button from "@/components/buttons/Button/Button";
import RejectFeedbackModal from "@/components/RejectFeedbackModal/RejectFeedbackModal";
import "./ReviewCard.scss";
import { Post } from "@/types/Post";

interface ReviewCardProps {
  postData: Post;
  campaignName?: string;
  authorName?: string;
  onApprove: () => void;
  onReject: (feedback: string) => void;
}

export default function ReviewCard({
  postData,
  campaignName,
  authorName,
  onApprove,
  onReject,
}: ReviewCardProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <div className="review-card">
        <h2>{postData.title}</h2>

        <div className="review-card__meta">
          <div className="review-card__field">
            <span className="review-card__label">Campaign</span>
            <span className="review-card__value">
              {campaignName ?? postData.campaign_id}
            </span>
          </div>
          <div className="review-card__field">
            <span className="review-card__label">Submitted by</span>
            <span className="review-card__value">
              {authorName ?? postData.author_id}
            </span>
          </div>
          <div className="review-card__field">
            <span className="review-card__label">Scheduled for</span>
            <span className="review-card__value">
              {formatDate(postData.scheduled_time)}
            </span>
          </div>
          <div className="review-card__field">
            <span className="review-card__label">Submitted at</span>
            <span className="review-card__value">
              {formatDate(postData.created_at)}
            </span>
          </div>
        </div>

        <div className="review-card__actions">
          <Button
            text="Approve"
            color="white"
            link="#"
            bgColor="green"
            onClick={onApprove}
          />
          <Button
            text="Reject"
            color="white"
            link="#"
            bgColor="red"
            onClick={() => setRejectModalOpen(true)}
          />
        </div>
      </div>

      <RejectFeedbackModal
        isOpen={rejectModalOpen}
        postTitle={postData.title}
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={(feedback: string) => {
          setRejectModalOpen(false);
          onReject(feedback);
        }}
      />
    </>
  );
}
