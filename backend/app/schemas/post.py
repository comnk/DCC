from datetime import datetime
from enum import Enum
from ..models.post import Post

class PostStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"

class PostSchema(Post):
    id: int
    author_id: str
    post_status: PostStatus
    created_at: datetime