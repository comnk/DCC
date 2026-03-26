from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class Post(BaseModel):
    campaign_id: int
    platform: list[str]
    title: str
    caption: str
    scheduled_time: Optional[datetime] = None
    photo_urls: list[str] = []
    is_draft: bool = False