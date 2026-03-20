import { Campaign } from "@/types/Campaign";
import Link from "next/link";

export default function CampaignCard({
  campaignData,
}: {
  campaignData: Campaign;
}) {
  return (
    <div>
      <h3>
        <Link href={`/campaign/${campaignData.id}`}>{campaignData.name}</Link>
      </h3>
      <p>
        Start: {new Date(campaignData.start_date).toLocaleDateString()} - End:{" "}
        {new Date(campaignData.end_date).toLocaleDateString()}
      </p>
    </div>
  );
}
