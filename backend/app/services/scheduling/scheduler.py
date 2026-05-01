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
        .select("id, platform, caption, scheduled_time, post_status, media_asset(*)")
        .eq("post_status", "scheduled")
        .lte("scheduled_time", now)
        .execute()
    )

    print(f"📋 Found {len(due_posts.data or [])} due posts, now={now}")
    for post in (due_posts.data or []):
        print(f"  - Post {post['id']}: scheduled_time={post['scheduled_time']}, platform={post['platform']}")
        _publish_with_retry(post, supabase)


def _publish_with_retry(post: dict, supabase):
    media_assets = post.get("media_asset") or []
    public_urls = _get_public_urls(media_assets, supabase)

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

    for platform in platforms:
        if platform == "instagram":
            _publish_to_instagram(caption, public_urls)
        elif platform == "linkedin":
            _publish_to_linkedin(caption, public_urls)
        elif platform == "discord":
            pass


def _publish_to_instagram(caption: str, media_urls: list[str]):
    if not media_urls:
        raise ValueError("Instagram requires at least one media asset")

    if len(media_urls) == 1:
        url = media_urls[0]
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

    post_id = publish_container(creation_id)
    if not post_id:
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