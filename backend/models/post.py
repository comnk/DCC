import datetime

from pydantic import BaseModel

class Post(BaseModel):
    id: int
    campaign_id: int
    author_id: int
    platform: str
    caption: str
    post_status: str
    scheduled_time: datetime
    created_at: datetime
    updated_at: datetime