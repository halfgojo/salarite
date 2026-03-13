from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: str
    priority: str
    assigned_to: int

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- Interview Schemas ---
class InterviewBase(BaseModel):
    candidate_name: str
    candidate_email: Optional[str] = None
    date: str
    time: str
    mode: str
    scheduled_by: int

class InterviewCreate(InterviewBase):
    pass

class InterviewResponse(InterviewBase):
    id: int
    call_room_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Activity Log Schemas ---
class ActivityLogResponse(BaseModel):
    id: int
    action: str
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- User Schemas ---
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True
