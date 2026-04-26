"use client";

import { PostStatusBadge } from "@/components/icons/PostStatusBadge/PostStatusBadge";
import "./PostCard.scss";

import Link from "next/link";

import { Post } from "@/types/Post";

function HighlightText({
  text,
  highlight,
  href,
}: {
  text: string;
  highlight: string;
  href: string;
}) {
  if (!highlight.trim()) {
    return (
      <Link href={href} className="post-card__title">
        {text}
      </Link>
    );
  }

  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const parts: { value: string; highlighted: boolean }[] = [];

  let i = 0;
  while (i < text.length) {
    const matchIndex = lowerText.indexOf(lowerHighlight, i);
    if (matchIndex === -1) {
      parts.push({ value: text.slice(i), highlighted: false });
      break;
    }
    if (matchIndex > i) {
      parts.push({ value: text.slice(i, matchIndex), highlighted: false });
    }
    parts.push({
      value: text.slice(matchIndex, matchIndex + highlight.length),
      highlighted: true,
    });
    i = matchIndex + highlight.length;
  }

  return (
    <Link href={href} className="post-card__title">
      {parts.map((part, idx) =>
        part.highlighted ? (
          <mark key={idx} className="post-card__highlight">
            {part.value}
          </mark>
        ) : (
          <span key={idx}>{part.value}</span>
        ),
      )}
    </Link>
  );
}

export default function PostCard({
  postData,
  campaignName,
  searchTerm,
}: {
  postData: Post;
  campaignName?: string;
  searchTerm: string;
}) {
  return (
    <div className="post-card">
      <PostStatusBadge post={postData} />
      <div className="post-card__body">
        <HighlightText
          text={postData.title}
          highlight={searchTerm}
          href={`/campaign/${postData.campaign_id}/posts/${postData.id}`}
        />
        <p className="post-card__caption">{postData.caption}</p>
        {campaignName && (
          <Link
            href={`/campaign/${postData.campaign_id}`}
            className="post-card__campaign"
          >
            {campaignName}
          </Link>
        )}
      </div>
    </div>
  );
}
