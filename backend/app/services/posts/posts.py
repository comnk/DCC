import jwt
from fastapi import HTTPException
from ...db.supabase import create_supabase_client_with_token
from ...utils.is_post_complete import is_post_complete


def delete_post_service(post_id: int, authorization: str):
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


def get_post_service(post_id: int, token: str):
    supabase = create_supabase_client_with_token(token)
    response = supabase.table("posts").select("*, media_asset(*)").eq("id", post_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found")
    return response.data[0]


def get_all_posts_service(token: str):
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")

    supabase = create_supabase_client_with_token(token)

    # Posts authored by user
    authored = supabase.table("posts").select("*").eq("author_id", user_id).execute()

    # Posts from campaigns user is a member of
    memberships = supabase.table("campaign_members").select("campaign_id").eq("user_id", user_id).execute()
    campaign_ids = [m["campaign_id"] for m in (memberships.data or [])]

    owned_campaigns = supabase.table("campaigns").select("id").eq("created_by", user_id).execute()
    owned_campaign_ids = [c["id"] for c in (owned_campaigns.data or [])]

    all_campaign_ids = list(set(campaign_ids + owned_campaign_ids))

    member_posts = []
    if all_campaign_ids:
        member_posts = supabase.table("posts").select("*").in_("campaign_id", all_campaign_ids).execute().data or []

    all_posts = {p["id"]: p for p in (authored.data or []) + member_posts}
    return list(all_posts.values())


def get_review_posts_service(token: str):
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    owned = supabase.table("campaigns").select("id").eq("created_by", user_id).execute()
    owned_ids = [c["id"] for c in (owned.data or [])]

    if not owned_ids:
        return []

    return supabase.table("posts").select("*, media_asset(*)").eq("post_status", "in_review").in_("campaign_id", owned_ids).execute().data


def get_review_count_service(token: str):
    payload = jwt.decode(token, options={"verify_signature": False})
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    owned = supabase.table("campaigns").select("id").eq("created_by", user_id).execute()
    owned_ids = [c["id"] for c in (owned.data or [])]

    if not owned_ids:
        return 0

    response = supabase.table("posts").select("id", count="exact").eq("post_status", "in_review").in_("campaign_id", owned_ids).execute()
    return response.count


def review_post_service(post_id: int, approved: bool, token: str):
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
    response = supabase.table("posts").update({"post_status": new_status}).eq("id", post_id).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update post status")
    return response.data[0]


def reject_post_service(post_id: int, feedback: str, token: str):
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

    response = supabase.table("posts").update({"post_status": "draft", "feedback": feedback}).eq("id", post_id).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to reject post")
    return response.data[0]


def cancel_post_service(post_id: int, token: str):
    payload = jwt.decode(token, options={"verify_signature": False})
    author_id = payload.get("sub")
    if not author_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase = create_supabase_client_with_token(token)
    response = supabase.table("posts").select("scheduled_time, post_status").eq("id", post_id).execute()

    if not response.data or response.data[0].get("scheduled_time") is None or response.data[0].get("post_status") != "scheduled":
        raise HTTPException(status_code=400, detail="Post is not scheduled or already published")

    response = supabase.table("posts").update({"post_status": "draft", "scheduled_time": None}).eq("id", post_id).eq("author_id", author_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    return response.data[0]


def create_post_service(post_data: dict, photo_urls: list, author_id: str, token: str):
    supabase = create_supabase_client_with_token(token)

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
        media_assets = [{"post_id": post_id, "file_url": url, "file_type": "image", "order_index": i} for i, url in enumerate(photo_urls)]
        media_response = supabase.table("media_asset").insert(media_assets).execute()
        if not media_response.data:
            raise HTTPException(status_code=500, detail="Failed to save media assets")

    return response.data[0]


def update_post_service(post_id: int, post_data: dict, author_id: str, token: str):
    supabase = create_supabase_client_with_token(token)

    existing_media = supabase.table("media_asset").select("id").eq("post_id", post_id).execute()
    has_media = len(existing_media.data or []) > 0

    if post_data.get("scheduled_time") and is_post_complete({**post_data, "media_asset": [True] if has_media else []}):
        post_data["post_status"] = "in_review"
        post_data["feedback"] = None
    else:
        post_data["post_status"] = "draft"

    response = supabase.table("posts").update(post_data).eq("id", post_id).eq("author_id", author_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    return response.data[0]