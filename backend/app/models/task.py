from pydantic import BaseModel
from typing import Optional
from datetime import date

class TaskCreate(BaseModel):
    title: str
    type: str = "copy"
    assigned_role: Optional[str] = None
    assigned_user_id: Optional[str] = None
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    assigned_role: Optional[str] = None
<<<<<<< HEAD
<<<<<<< HEAD
    assigned_user_id: str | None = None
=======
    assigned_user_id: Optional[str] = None
>>>>>>> 73e21ee (starter tasks component for posts)
=======
    assigned_user_id: str | None = None
>>>>>>> 88da3ae (second version of tasks system)
    due_date: Optional[date] = None
    status: Optional[str] = None