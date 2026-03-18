from datetime import datetime
from pydantic import BaseModel

class Post(BaseModel):
    campaign_id: int
    platform: list[str]
    title: str
    caption: str
    scheduled_time: datetime