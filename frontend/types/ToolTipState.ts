export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  event: {
    id: string;
    title: string;
    caption?: string;
    platform?: string;
    is_draft?: boolean;
    post_status?: string;
    campaign_id?: string;
  } | null;
}