from pydantic import BaseModel
from datetime import datetime

class MediaAsset(BaseModel):
    id: str
    post_id: str
    file_url: str
    file_type: str
    uploaded_by: str
    created_at: datetime