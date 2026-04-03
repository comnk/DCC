import { Campaign } from "@/types/Campaign";

export const validatePost = (
  formData: {
    title: string;
    platform: string[];
    caption: string;
    media_asset: string[];
    scheduled_time: string;
  },
  campaign: Campaign | undefined,
): string | null => {
  if (!formData.title.trim()) return "Title is required";
  if (formData.platform.length === 0) return "Select at least one platform";
  if (!formData.caption.trim()) return "Caption is required";
  if (formData.media_asset.length === 0) return "At least one image is required";
  if (!formData.scheduled_time) return "Scheduled time is required";
  if (!campaign) return "Campaign data not loaded yet, please try again";

  const scheduled = new Date(formData.scheduled_time);
  const start = new Date(campaign.start_date);
  const end = new Date(campaign.end_date);

  if (scheduled < start || scheduled > end) {
    return `Scheduled time must be between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}`;
  }

  return null;
};