import UpdateCampaignForm from "@/components/forms/UpdateCampaignForm/UpdateCampaignForm";
import Navbar from "@/components/Navbar/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Params } from "@/types/Params";

export default async function UpdateCampaignPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`http://localhost:8000/campaigns/${id}`, {
    method: "GET",
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  const campaign = await res.json();

  return (
    <div>
      <Navbar />
      <h2>Update Campaign</h2>
      <UpdateCampaignForm campaignId={id} campaignData={campaign} />
    </div>
  );
}
