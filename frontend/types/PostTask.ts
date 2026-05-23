export type PostTask = {
    id: number;
    post_id: number;
    title: string;
    type: "copy" | "design" | "media" | "review";
    assigned_role: string | null;
    assigned_user_id: string | null;
    due_date: string | null;
    status: "todo" | "in_progress" | "done";
    created_at: string;
    user_profiles?: { display_name: string; profile_picture: string | null };
}