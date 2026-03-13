from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # "employer" or "hr"

    tasks_assigned = relationship("Task", back_populates="assignee")
    interviews_scheduled = relationship("Interview", back_populates="scheduler")
    activities = relationship("ActivityLog", back_populates="user")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(String) # "High", "Medium", "Low"
    status = Column(String, default="Pending") # "Pending", "In Progress", "Completed"
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    assignee = relationship("User", back_populates="tasks_assigned")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, index=True)
    candidate_email = Column(String, nullable=True)
    date = Column(String)
    time = Column(String)
    mode = Column(String) # "Voice Call", "Video Call", "Chat Interview"
    status = Column(String, default="Scheduled") # "Scheduled", "Completed", "Cancelled"
    scheduled_by = Column(Integer, ForeignKey("users.id"))
    call_room_id = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scheduler = relationship("User", back_populates="interviews_scheduled")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activities")
