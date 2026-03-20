from datetime import date, datetime

from pydantic import BaseModel

class Campaign(BaseModel):
    name: str
    description: str
    start_date: date
    end_date: date
    archived_at: datetime | None = None