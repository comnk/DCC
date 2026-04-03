import jwt

from fastapi import APIRouter, HTTPException, Header
from ..db.supabase import create_supabase_client_with_token
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
    
    post_data = post.model_dump(mode="json")
    photo_urls = post_data.pop("media_asset", [])
    
    if post_data.get("scheduled_time") and is_post_complete({**post_data, "media_asset": photo_urls}):
        post_data["post_status"] = "scheduled"
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
    supabase = create_supabase_client_with_token(token)
    response = supabase.table("posts").select("*").execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No posts found")

    return response.data or []

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
    photo_urls = post_data.pop("media_asset", [])

    if post_data.get("scheduled_time") and is_post_complete({**post_data, "media_asset": photo_urls}):
        post_data["post_status"] = "scheduled"
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

@router.delete("/{post_id}")
def delete_post(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    author_id = payload.get("sub")

    if not author_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    
    response = supabase.table("media_asset").delete().eq("post_id", post_id).execute()
    
    if (not response.data):
        raise HTTPException(status_code=500, detail="Failed to delete media assets")
    
    response = (
        supabase.table("posts")
        .delete()
        .eq("id", post_id)
        .eq("author_id", author_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    
    return {"message": "Post deleted successfully"}