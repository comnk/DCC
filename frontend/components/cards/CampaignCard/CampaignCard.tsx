import "./CampaignCard.scss";

import { Campaign } from "@/types/Campaign";
import Link from "next/link";

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
      <Link href={href} className="campaign-card__link">
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
    <Link href={href} className="campaign-card__link">
      {parts.map((part, i) =>
        part.highlighted ? (
          <mark key={i} className="campaign-card__highlight">
            {part.value}
          </mark>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </Link>
  );
}

export default function CampaignCard({
  campaignData,
  searchTerm = "",
}: {
  campaignData: Campaign;
  searchTerm?: string;
}) {
  return (
    <div className="campaign-card">
      <h3 className="campaign-card__title">
        <HighlightText
          text={campaignData.name}
          highlight={searchTerm}
          href={`/campaign/${campaignData.id}`}
        />
      </h3>
      <p className="campaign-card__dates">
        {new Date(campaignData.start_date).toLocaleDateString()} —{" "}
        {new Date(campaignData.end_date).toLocaleDateString()}
      </p>
    </div>
  );
}
