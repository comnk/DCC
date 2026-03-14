import datetime

from pydantic import BaseModel

class Campaign(BaseModel):
    id: int
    title: str
    description: str
    created_by: str
    start_date: datetime
    end_date: datetime
    status: str
    created_at: datetime
    updated_at: datetime