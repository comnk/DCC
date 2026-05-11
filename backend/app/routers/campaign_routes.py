import jwt

from fastapi import APIRouter, HTTPException, Header, Body
from ..db.supabase import create_supabase_client_with_token
from ..models.campaign import Campaign
from ..services.posts.posts import delete_post_service
from ..utils.check_owner import check_owner

router = APIRouter(prefix="/campaigns", tags=["campaign"])

@router.post("/create")
def create_campaign(campaign: Campaign, authorization: str = Header(...)):
    """Create a new campaign"""
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")

    supabase = create_supabase_client_with_token(token)
    data = campaign.model_dump(mode="json")
    data["created_by"] = user_id
    response = supabase.table("campaigns").insert(data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create campaign")

    return response.data[0]

@router.get("/list")
def list_campaigns(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    if not token or token == "undefined":
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")

    supabase = create_supabase_client_with_token(token)

    created = supabase.table("campaigns").select("*").eq("created_by", user_id).execute()

    memberships = supabase.table("campaign_members").select("campaign_id").eq("user_id", user_id).execute()
    member_ids = [m["campaign_id"] for m in (memberships.data or [])]

    member_campaigns = []
    if member_ids:
        member_campaigns = supabase.table("campaigns").select("*").in_("id", member_ids).execute().data or []

    all_campaigns = {c["id"]: c for c in (created.data or []) + member_campaigns}
    
    return list(all_campaigns.values())

@router.get("/{campaign_id}")
def get_campaign(campaign_id: int, authorization: str = Header(...)):
    """Get campaign details by ID"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    
    try:
        response = supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve campaign")
    
    if (not response.data):
        raise HTTPException(status_code=500, detail="Campaign not found")
    
    return response.data[0]

@router.put("/{campaign_id}")
def update_campaign(campaign_id: int, campaign: Campaign, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    supabase = create_supabase_client_with_token(token)
    check_owner(supabase, campaign_id, user_id)

    response = supabase.table("campaigns").update(campaign.model_dump(mode="json")).eq("id", campaign_id).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update campaign")
    return response.data[0]

@router.post("/{campaign_id}/toggle_archive")
def toggle_archive_campaign(campaign_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    supabase = create_supabase_client_with_token(token)
    check_owner(supabase, campaign_id, user_id)
    
    current = supabase.table("campaigns").select("is_archived").eq("id", campaign_id).execute()
    
    if not current.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    is_archived = current.data[0]["is_archived"]
    
    response = supabase.table("campaigns").update({
        "is_archived": not is_archived,
        "archived_at": "now()" if not is_archived else None
    }).eq("id", campaign_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update campaign")

    return {"message": "Campaign archived successfully" if not is_archived else "Campaign unarchived successfully"}

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    supabase = create_supabase_client_with_token(token)
    check_owner(supabase, campaign_id, user_id)
    
    campaign = supabase.table("campaigns").select("id").eq("id", campaign_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    posts = supabase.table("posts").select("id").eq("campaign_id", campaign_id).execute()
    if posts.data:
        for post in posts.data:
            delete_post_service(post["id"], authorization)
    
    supabase.table("campaign_members").delete().eq("campaign_id", campaign_id).execute()
    supabase.table("campaigns").delete().eq("id", campaign_id).execute()
    
    return {"message": "Campaign deleted successfully"}

@router.get("/{campaign_id}/posts")
def get_campaign_posts(campaign_id: int, authorization: str = Header(...)):
    """Get all posts associated with a campaign"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    response = supabase.table("posts").select("*").eq("campaign_id", campaign_id).execute()
    
    if not response.data:
        return []
    
    return response.data

@router.post("/{campaign_id}/members")
def add_campaign_member(
    campaign_id: int,
    user_id: str = Body(..., embed=True),
    authorization: str = Header(...)
):
    """Add a member to a campaign"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    
    campaign = supabase.table("campaigns").select("id").eq("id", campaign_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    user = supabase.table("user_profiles").select("id").eq("id", user_id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing_member = supabase.table("campaign_members").select("*").eq("campaign_id", campaign_id).eq("user_id", user_id).execute()
    if existing_member.data:
        raise HTTPException(status_code=400, detail="User is already a member of this campaign")
    
    supabase.table("campaign_members").insert({
        "campaign_id": campaign_id,
        "user_id": user_id
    }).execute()
    
    return {"message": "Member added successfully"}

@router.delete("/{campaign_id}/members/{user_id}")
def remove_campaign_member(campaign_id: int, user_id: str, authorization: str = Header(...)):
    """Remove a member from a campaign"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    
    campaign = supabase.table("campaigns").select("id").eq("id", campaign_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    user = supabase.table("user_profiles").select("id").eq("id", user_id).execute()
    if not user.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing_member = supabase.table("campaign_members").select("*").eq("campaign_id", campaign_id).eq("user_id", user_id).execute()
    if not existing_member.data:
        raise HTTPException(status_code=400, detail="User is not a member of this campaign")
    
    supabase.table("campaign_members").delete().eq("campaign_id", campaign_id).eq("user_id", user_id).execute()
    
    return {"message": "Member removed successfully"}

@router.get("/{campaign_id}/members")
def list_campaign_members(campaign_id: int, authorization: str = Header(...)):
    """List all members of a campaign"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    
    campaign = supabase.table("campaigns").select("id").eq("id", campaign_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    members = supabase.table("campaign_members").select("user_id").eq("campaign_id", campaign_id).execute()
    member_ids = [m["user_id"] for m in (members.data or [])]
    
    if not member_ids:
        return []
    
    users = supabase.table("user_profiles").select("*").in_("id", member_ids).execute()
    
    return users.data or []