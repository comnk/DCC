import jwt

from fastapi import APIRouter, HTTPException, Header
from ..db.supabase import create_supabase_client_with_token
from ..models.campaign import Campaign

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
    """List all campaigns for the authenticated user"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    if not token or token == "undefined":
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    supabase = create_supabase_client_with_token(token)
    response = supabase.table("campaigns").select("*").execute()
    
    if not response.data:
        return []
    
    return response.data

@router.get("/{campaign_id}")
def get_campaign(campaign_id: int, authorization: str = Header(...)):
    """Get campaign details by ID"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    response = supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
    
    if (not response.data):
        raise HTTPException(status_code=500, detail="Campaign not found")
    
    return response.data[0]

@router.put("/{campaign_id}")
def update_campaign(campaign_id: int, campaign: Campaign, authorization: str = Header(...)):
    """Update campaign details by ID"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    response = supabase.table("campaigns").update(campaign.model_dump(mode="json")).eq("id", campaign_id).execute()
    
    if (not response.data):
        raise HTTPException(status_code=500, detail="Campaign not found or failed to update")
    
    return response.data[0]

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, authorization: str = Header(...)):
    """Delete a campaign by ID"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    response = supabase.table("campaigns").delete().eq("id", campaign_id).execute()
    
    if (response.status_code != 204):
        raise HTTPException(status_code=500, detail="Campaign not found or failed to delete")
    
    return {"message": "Campaign deleted successfully"}

@router.get("/{campaign_id}/posts")
def get_campaign_posts(campaign_id: int, authorization: str = Header(...)):
    """Get all posts associated with a campaign"""
    supabase = create_supabase_client_with_token(authorization.replace("Bearer ", ""))
    response = supabase.table("posts").select("*").eq("campaign_id", campaign_id).execute()
    
    if not response.data:
        return []
    
    return response.data