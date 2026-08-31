export type Campaign = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  is_archived: boolean;
  archived_at: string | null;
  created_by: string;
};