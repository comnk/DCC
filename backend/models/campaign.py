from datetime import date

from pydantic import BaseModel

class Campaign(BaseModel):
    name: str
    description: str
    start_date: date
    end_date: date