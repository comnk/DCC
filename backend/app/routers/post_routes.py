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
    data = {**post.model_dump(mode="json"), "author_id": author_id}
    response = supabase.table("posts").insert(data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create post")

    return response.data[0]

@router.get("/all")
def get_all_posts(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)
    response = supabase.table("posts").select("*").execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No posts found")

    return response.data[0]

@router.get("/{post_id}")
def get_post(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)
    response = supabase.table("posts").select("*").eq("id", post_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return response.data[0]

@router.put("/{post_id}")
def update_post(post_id: int, post: Post, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    supabase = create_supabase_client_with_token(token)
    response = supabase.table("posts").update(post.model_dump(mode="json")).eq("id", post_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return response.data[0]