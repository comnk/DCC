def is_post_complete(post_data: dict) -> bool:
    return all([
        post_data.get("title"),
        post_data.get("caption"),
        post_data.get("platform"),
        post_data.get("scheduled_time"),
        post_data.get("media_asset") and len(post_data["media_asset"]) > 0
    ])