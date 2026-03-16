from datetime import datetime
from uuid import UUID
from enum import Enum
from models.campaign import Campaign

class Status(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class CampaignSchema(Campaign):
    id: int
    status: Status
    created_by: UUID
    created_at: datetime
    updated_at: datetime