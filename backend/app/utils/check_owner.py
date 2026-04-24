from fastapi import HTTPException

def check_owner(supabase, campaign_id: int, user_id: str):
    campaign = supabase.table("campaigns").select("created_by").eq("id", campaign_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.data[0]["created_by"] != user_id:
        raise HTTPException(status_code=403, detail="Only the campaign owner can perform this action")