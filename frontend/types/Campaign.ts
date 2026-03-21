export type Campaign = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_archived: boolean;
  archived_at: string | null;
};