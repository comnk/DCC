import jwt
from fastapi import HTTPException, Header
from ...db.supabase import create_supabase_client_with_token

def delete_post_service(post_id: int, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    post = supabase.table("posts").select("author_id").eq("id", post_id).execute()

    if not post.data:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.data[0]["author_id"] != user_id:
        raise HTTPException(status_code=403, detail="Only the post author can delete this post")

    supabase.table("media_asset").delete().eq("post_id", post_id).execute()

    response = supabase.table("posts").delete().eq("id", post_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found or already deleted")