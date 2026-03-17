import datetime

from enum import Enum

from models.post import Post

class PostStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"

class PostSchema(Post):
    id: int
    campaign_id: int
    author_id: int
    platform: str
    caption: str
    post_status: PostStatus
    scheduled_time: datetime
    created_at: datetime
    updated_at: datetime