import { MediaAsset } from "./MediaAsset";

export type Post = {
  id: number;
  title: string;
  caption: string;
  platform: string[];
  scheduled_time: string;
  is_draft: boolean;
  post_status: string;
  media_asset: MediaAsset[];
  campaign_id: number;
  author_id: string;
  created_at: string;
  updated_at?: string;
};