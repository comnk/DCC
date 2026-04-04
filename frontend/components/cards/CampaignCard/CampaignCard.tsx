import "./CampaignCard.scss";

import { Campaign } from "@/types/Campaign";
import Link from "next/link";

export default function CampaignCard({
  campaignData,
}: {
  campaignData: Campaign;
}) {
  return (
    <div className="campaign-card">
      <h3 className="campaign-card__name">
        <Link href={`/campaign/${campaignData.id}`}>{campaignData.name}</Link>
      </h3>
      <p className="campaign-card__dates">
        {new Date(campaignData.start_date).toLocaleDateString()} —{" "}
        {new Date(campaignData.end_date).toLocaleDateString()}
      </p>
    </div>
  );
}
