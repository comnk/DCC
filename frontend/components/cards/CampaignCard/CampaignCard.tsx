import "./CampaignCard.scss";

import { Campaign } from "@/types/Campaign";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";

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
  isOwner = false,
}: {
  campaignData: Campaign;
  searchTerm?: string;
  isOwner?: boolean;
}) {
  return (
    <div className="campaign-card">
      <div className="campaign-card__header">
        <h3 className="campaign-card__title">
          <HighlightText
            text={campaignData.name}
            highlight={searchTerm}
            href={`/campaign/${campaignData.id}`}
          />
        </h3>
        {isOwner && (
          <Link
            href={`/campaign/${campaignData.id}/update`}
            className="campaign-card__edit"
            onClick={(e) => e.stopPropagation()}
            title="Edit campaign"
          >
            <EditIcon fontSize="small" />
          </Link>
        )}
      </div>
      <p className="campaign-card__dates">
        {new Date(campaignData.start_date + "T00:00:00").toLocaleDateString()} —{" "}
        {new Date(campaignData.end_date + "T00:00:00").toLocaleDateString()}
      </p>
    </div>
  );
}
