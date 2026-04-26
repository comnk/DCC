import jwt

from fastapi import APIRouter, HTTPException, Header
from ..db.supabase import create_supabase_client_with_token
from ..services.posts.posts import delete_post_service
from ..models.post import Post
from ..utils.is_post_complete import is_post_complete

router = APIRouter(prefix="/posts", tags=["posts"])

@router.post("/create")
def create_post(post: Post, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    author_id = payload.get("sub")

    if not author_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    
    campaign = supabase.table("campaigns").select("created_by").eq("id", post.campaign_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    is_owner = campaign.data[0]["created_by"] == author_id
    if not is_owner:
        membership = supabase.table("campaign_members").select("user_id")\
            .eq("campaign_id", post.campaign_id)\
            .eq("user_id", author_id)\
            .execute()
        if not membership.data:
            raise HTTPException(status_code=403, detail="Not a member of this campaign")
    
    post_data = post.model_dump(mode="json")
    photo_urls = post_data.pop("media_asset", [])
    
    if post_data.get("scheduled_time") and is_post_complete({**post_data, "media_asset": photo_urls}):
        post_data["post_status"] = "in_review"
        post_data["feedback"] = None
    else:
        post_data["post_status"] = "draft"
    
    response = supabase.table("posts").insert({**post_data, "author_id": author_id}).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create post")

    post_id = response.data[0]["id"]
    
    if photo_urls:
        media_assets = [
            {
                "post_id": post_id,
                "file_url": url,
                "file_type": "image",
                "order_index": i,
            }
            for i, url in enumerate(photo_urls)
        ]
        
        media_response = supabase.table("media_asset").insert(media_assets).execute()

        if not media_response.data:
            raise HTTPException(status_code=500, detail="Failed to save media assets")
        
    return response.data[0]

@router.get("/all")
def get_all_posts(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")

    supabase = create_supabase_client_with_token(token)

    authored = supabase.table("posts").select("*").eq("author_id", user_id).execute()

    memberships = supabase.table("campaign_members").select("campaign_id").eq("user_id", user_id).execute()
    campaign_ids = [m["campaign_id"] for m in (memberships.data or [])]

    member_posts = []
    if campaign_ids:
        member_posts = supabase.table("posts").select("*").in_("campaign_id", campaign_ids).execute().data or []

    all_posts = {p["id"]: p for p in (authored.data or []) + member_posts}

    return list(all_posts.values())

@router.get("/need_review")
def get_need_review_posts(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)

    owned_campaigns = supabase.table("campaigns").select("id").eq("created_by", user_id).execute()
    owned_ids = [c["id"] for c in (owned_campaigns.data or [])]

    if not owned_ids:
        return []

    response = (
        supabase.table("posts")
        .select("*, media_asset(*)")
        .eq("post_status", "in_review")
        .in_("campaign_id", owned_ids)
        .execute()
    )
    return response.data

@router.get("/need_review/count")
def get_need_review_count(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)

    owned_campaigns = supabase.table("campaigns").select("id").eq("created_by", user_id).execute()
    owned_ids = [c["id"] for c in (owned_campaigns.data or [])]

    if not owned_ids:
        return {"count": 0}

    response = (
        supabase.table("posts")
        .select("id", count="exact")
        .eq("post_status", "in_review")
        .in_("campaign_id", owned_ids)
        .execute()
    )
    return {"count": response.count}

@router.get("/{post_id}")
def get_post(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)
    response = supabase.table("posts").select("*, media_asset(*)").eq("id", post_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found")

    return response.data[0]

@router.put("/{post_id}/cancel_post")
def cancel_scheduled_post(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    author_id = payload.get("sub")

    if not author_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    
    response = supabase.table("posts").select("scheduled_time, post_status").eq("id", post_id).execute()
    
    if (response.data[0].get("scheduled_time") is None) or (response.data[0].get("post_status") != "scheduled"):
        raise HTTPException(status_code=400, detail="Post is not scheduled or already published")
    
    response = (
        supabase.table("posts")
        .update({"post_status": "draft", "scheduled_time": None})
        .eq("id", post_id)
        .eq("author_id", author_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    
    return response.data[0]

@router.put("/{post_id}")
def update_post(post_id: int, post: Post, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    author_id = payload.get("sub")

    if not author_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    post_data = post.model_dump(mode="json")
    post_data.pop("media_asset", [])

    existing_media = supabase.table("media_asset").select("id").eq("post_id", post_id).execute()
    has_media = len(existing_media.data or []) > 0

    if post_data.get("scheduled_time") and is_post_complete({**post_data, "media_asset": [True] if has_media else []}):
        post_data["post_status"] = "in_review"
        post_data["feedback"] = None
    else:
        post_data["post_status"] = "draft"

    response = (
        supabase.table("posts")
        .update(post_data)
        .eq("id", post_id)
        .eq("author_id", author_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")

    return response.data[0]

@router.put("/{post_id}/review")
def review_post(post_id: int, approved: bool, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    reviewer_id = payload.get("sub")

    if not reviewer_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)

    post_response = supabase.table("posts").select("post_status, campaign_id").eq("id", post_id).execute()

    if not post_response.data:
        raise HTTPException(status_code=404, detail="Post not found")

    post = post_response.data[0]

    if post["post_status"] != "in_review":
        raise HTTPException(status_code=400, detail="Post is not pending review")

    campaign = supabase.table("campaigns").select("created_by").eq("id", post["campaign_id"]).execute()

    if not campaign.data or campaign.data[0]["created_by"] != reviewer_id:
        raise HTTPException(status_code=403, detail="Only the campaign owner can review posts")

    new_status = "scheduled" if approved else "draft"

    response = (
        supabase.table("posts")
        .update({"post_status": new_status})
        .eq("id", post_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update post status")

    return response.data[0]

@router.put("/{post_id}/reject")
def reject_post(post_id: int, feedback: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    reviewer_id = payload.get("sub")

    if not reviewer_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)

    post_response = supabase.table("posts").select("post_status, campaign_id").eq("id", post_id).execute()

    if not post_response.data:
        raise HTTPException(status_code=404, detail="Post not found")

    post = post_response.data[0]

    if post["post_status"] != "in_review":
        raise HTTPException(status_code=400, detail="Post is not pending review")

    campaign = supabase.table("campaigns").select("created_by").eq("id", post["campaign_id"]).execute()

    if not campaign.data or campaign.data[0]["created_by"] != reviewer_id:
        raise HTTPException(status_code=403, detail="Only the campaign owner can reject posts")

    response = (
        supabase.table("posts")
        .update({"post_status": "draft", "feedback": feedback})
        .eq("id", post_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to reject post")

    return response.data[0]

@router.delete("/{post_id}/delete_image")
def delete_post_image(post_id: int, image_url: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    author_id = payload.get("sub")

    if not author_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    
    post_response = supabase.table("posts").select("author_id").eq("id", post_id).execute()
    
    if not post_response.data or post_response.data[0]["author_id"] != author_id:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")

    response = (
        supabase.table("media_asset")
        .delete()
        .eq("post_id", post_id)
        .eq("file_url", image_url)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Image not found or unauthorized")
    
    return {"message": "Image deleted successfully"}

@router.delete("/{post_id}")
def delete_post(post_id: int, authorization: str = Header(...)):
    delete_post_service(post_id, authorization)
    
    return {"message": "Post deleted successfully"}