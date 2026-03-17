import datetime

from pydantic import BaseModel

class Post(BaseModel):
    campaign_id: int
    author_id: int
    platform: str
    caption: str
    scheduled_time: datetime