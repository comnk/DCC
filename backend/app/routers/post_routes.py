import jwt

from fastapi import APIRouter, HTTPException, Header
from ..db.supabase import create_supabase_client_with_token
from ..models.post import Post

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

    files = supabase.storage.from_("post-images").list("posts")
    print(f"DEBUG files in posts/: {files}")
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found")

    post = response.data[0]

    for asset in post.get("media_asset", []):
        stored_url = asset.get("file_url", "")
        if "/object/sign/post-images/" in stored_url:
            path = stored_url.split("/object/sign/post-images/")[1].split("?")[0]
        elif "/object/public/post-images/" in stored_url:
            path = stored_url.split("/object/public/post-images/")[1]
        else:
            continue

        try:
            signed = supabase.storage.from_("post-images").create_signed_url(path, 3600)
            asset["file_url"] = signed["signedURL"]
        except Exception as e:
            print(f"Failed to re-sign URL for path '{path}': {e}")

    return post

@router.put("/{post_id}")
def update_post(post_id: int, post: Post, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    author_id = payload.get("sub")

    if not author_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    response = (
        supabase.table("posts")
        .update(post.model_dump(mode="json"))
        .eq("id", post_id)
        .eq("author_id", author_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    
    return response.data[0]