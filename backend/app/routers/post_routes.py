from fastapi import APIRouter, HTTPException, Header

from ..db.supabase import create_supabase_client_with_token
from ..services.posts.posts import (
    delete_post_service, get_post_service, get_all_posts_service,
    get_review_posts_service, get_review_count_service,
    review_post_service, reject_post_service, cancel_post_service,
    create_post_service, update_post_service,
)
from ..models.post import Post
from ..utils.extract_token import extract_token

router = APIRouter(prefix="/posts", tags=["posts", "tasks"])

@router.post("/create")
def create_post(post: Post, authorization: str = Header(...)):
    token, author_id = extract_token(authorization)
    supabase = create_supabase_client_with_token(token)

    campaign = supabase.table("campaigns").select("created_by").eq("id", post.campaign_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.data[0]["created_by"] != author_id:
        membership = supabase.table("campaign_members").select("user_id").eq("campaign_id", post.campaign_id).eq("user_id", author_id).execute()
        if not membership.data:
            raise HTTPException(status_code=403, detail="Not a member of this campaign")

    post_data = post.model_dump(mode="json")
    photo_urls = post_data.pop("media_asset", [])
    return create_post_service(post_data, photo_urls, author_id, token)

@router.get("/all")
def get_all_posts(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return get_all_posts_service(token)

@router.get("/need_review/count")
def get_need_review_count(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return {"count": get_review_count_service(token)}

@router.get("/need_review")
def get_need_review_posts(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return get_review_posts_service(token)

@router.put("/{post_id}/submit_for_review")
def submit_for_review(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)

    post = supabase.table("posts").select("post_status").eq("id", post_id).execute()
    if not post.data:
        raise HTTPException(status_code=404, detail="Post not found")
    
    current_status = post.data[0]["post_status"]
    if current_status in ("needs_review", "approved", "posted"):
        return post.data[0]

    response = supabase.table("posts").update({"post_status": "needs_review"}).eq("id", post_id).execute()
    return response.data[0]

@router.get("/{post_id}")
def get_post(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return get_post_service(post_id, token)

@router.put("/{post_id}/cancel_post")
def cancel_scheduled_post(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return cancel_post_service(post_id, token)

@router.put("/{post_id}/review")
def review_post(post_id: int, approved: bool, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return review_post_service(post_id, approved, token)

@router.put("/{post_id}/reject")
def reject_post(post_id: int, feedback: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return reject_post_service(post_id, feedback, token)

@router.put("/{post_id}")
def update_post(post_id: int, post: Post, authorization: str = Header(...)):
    token, author_id = extract_token(authorization)
    post_data = post.model_dump(mode="json")
    post_data.pop("media_asset", [])
    return update_post_service(post_id, post_data, author_id, token)

@router.delete("/{post_id}/delete_image")
def delete_post_image(post_id: int, image_url: str, authorization: str = Header(...)):
    token, author_id = extract_token(authorization)
    supabase = create_supabase_client_with_token(token)

    post_response = supabase.table("posts").select("author_id").eq("id", post_id).execute()
    if not post_response.data or post_response.data[0]["author_id"] != author_id:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")

    response = supabase.table("media_asset").delete().eq("post_id", post_id).eq("file_url", image_url).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Image not found or unauthorized")
    return {"message": "Image deleted successfully"}

@router.delete("/{post_id}")
def delete_post(post_id: int, authorization: str = Header(...)):
    delete_post_service(post_id, authorization)
    return {"message": "Post deleted successfully"}