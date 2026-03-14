from pydantic import BaseModel
from datetime import datetime

class ApprovalLog(BaseModel):
    id: str
    post_id: str
    reviewer_id: str
    action: str
    comment: str
    timestamp: datetime