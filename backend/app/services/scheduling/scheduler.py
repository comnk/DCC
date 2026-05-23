import time

from datetime import datetime, timezone

from ...db.supabase import create_supabase_admin_client
from ..instagram.instagram_graph import (
    create_photo_container,
    create_carousel_container,
    create_video_container,
    publish_container,
    wait_until_ready,
)
from ..linkedin.posts import post_to_linkedin
from ..discord.discord_bot import post_to_discord

MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 30


def _get_public_urls(media_assets: list, supabase) -> list[str]:
    urls = []
    for asset in media_assets:
        public_url = supabase.storage.from_("post-images").get_public_url(asset["file_url"])
        urls.append(public_url)
    return urls


def check_and_publish_posts():
    print(f"🔍 Scheduler tick at {datetime.now(timezone.utc).isoformat()}")
    supabase = create_supabase_admin_client()
    now = datetime.now(timezone.utc).replace(tzinfo=None).isoformat(sep=" ", timespec="seconds")

    due_posts = (
        supabase.table("posts")
        .select("id, platform, caption, scheduled_time, post_status, instagram_post_type, discord_location, discord_event_start, discord_event_end, media_asset(*)")
        .eq("post_status", "scheduled")
        .lte("scheduled_time", now)
        .execute()
    )

    print(f"📋 Found {len(due_posts.data or [])} due posts, now={now}")
    for post in (due_posts.data or []):
        print(f"  - Post {post['id']}: scheduled_time={post['scheduled_time']}, platform={post['platform']}")
        _publish_with_retry(post, supabase)


def _publish_with_retry(post: dict, supabase):
    supabase.table("posts").update({"post_status": "publishing"}).eq("id", post["id"]).execute()
    
    media_assets = post.get("media_asset") or []
    public_urls = _get_public_urls(media_assets, supabase)
    supabase.table("posts").update({"post_status": "publishing"}).eq("id", post["id"]).execute()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            publish_post(post, public_urls)
            supabase.table("posts").update({"post_status": "published"}).eq("id", post["id"]).execute()
            print(f"✅ Published post {post['id']} (attempt {attempt})")
            return
        except Exception as e:
            print(f"⚠️ Attempt {attempt}/{MAX_RETRIES} failed for post {post['id']}: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SECONDS)

    supabase.table("posts").update({"post_status": "failed"}).eq("id", post["id"]).execute()
    print(f"❌ Post {post['id']} permanently failed after {MAX_RETRIES} attempts")


def publish_post(post: dict, public_urls: list[str]):
    platforms = [p.lower() for p in (post.get("platform") or [])]
    caption = post.get("caption", "")
    instagram_post_type = post.get("instagram_post_type", "post")

    for platform in platforms:
        if platform == "instagram":
            _publish_to_instagram(caption, public_urls, instagram_post_type)
        elif platform == "linkedin":
            _publish_to_linkedin(caption, public_urls)
        elif platform == "discord":
            _publish_to_discord(
                caption,
                public_urls,
                discord_location=post.get("discord_location", "Online"),
                discord_event_start=post.get("discord_event_start"),
                discord_event_end=post.get("discord_event_end"),
            )


def _publish_to_instagram(caption: str, media_urls: list[str], post_type: str = "post"):
    if not media_urls:
        raise ValueError("Instagram requires at least one media asset")

    url = media_urls[0] if len(media_urls) == 1 else None

    if post_type == "story":
        from ..instagram.instagram_graph import create_stories_container
        if url:
            media_type = "VIDEO" if url.endswith((".mp4", ".mov")) else "IMAGE"
            creation_id = create_stories_container(url, media_type=media_type)
        else:
            raise ValueError("Stories only support a single media item")
    else:
        if len(media_urls) == 1:
            if url.endswith(".mp4") or url.endswith(".mov"):
                creation_id = create_video_container(media_url=url, caption=caption)
            else:
                creation_id = create_photo_container(photo_url=url, caption=caption)
        else:
            creation_id = create_carousel_container(media_urls=media_urls, caption=caption)

    if not creation_id:
        raise RuntimeError("Failed to create Instagram media container")
    if not wait_until_ready(creation_id):
        raise RuntimeError(f"Instagram container {creation_id} never became ready")
    if not publish_container(creation_id):
        raise RuntimeError("Failed to publish Instagram container")


def _publish_to_linkedin(caption: str, media_urls: list[str]):
    image_url = None
    video_url = None

    if media_urls:
        url = media_urls[0]
        if url.endswith(".mp4") or url.endswith(".mov"):
            video_url = url
        else:
            image_url = url

    post_to_linkedin(caption, image_url=image_url, video_url=video_url)

def _publish_to_discord(caption: str, media_urls: list[str], scheduled_time: str = None):
    result = post_to_discord(
        caption=caption,
        media_urls=media_urls,
        scheduled_time=scheduled_time,
    )
    if not result:
        raise RuntimeError("Failed to create Discord scheduled event")