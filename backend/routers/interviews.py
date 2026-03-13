from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

import models, schemas
from database import get_db

router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"]
)

def log_activity(db: Session, action: str, user_id: int):
    log = models.ActivityLog(action=action, user_id=user_id)
    db.add(log)
    db.commit()

@router.post("/", response_model=schemas.InterviewResponse)
def schedule_interview(interview: schemas.InterviewCreate, db: Session = Depends(get_db)):
    call_room_id = str(uuid.uuid4())[:8]
    db_interview = models.Interview(**interview.model_dump(), call_room_id=call_room_id)
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    
    hr_user = db.query(models.User).filter(models.User.id == interview.scheduled_by).first()
    hr_name = hr_user.name if hr_user else f"HR {interview.scheduled_by}"
    
    # Log the scheduling activity
    log_activity(db, f"📅 {hr_name} scheduled interview with {interview.candidate_name}", user_id=interview.scheduled_by)
    
    # Simulate sending email notification (log it as activity)
    if interview.candidate_email:
        log_activity(db, f"📧 Invite sent to {interview.candidate_email} for {interview.mode} on {interview.date}", user_id=interview.scheduled_by)
    
    return db_interview

@router.get("/", response_model=List[schemas.InterviewResponse])
def get_interviews(db: Session = Depends(get_db)):
    return db.query(models.Interview).order_by(models.Interview.created_at.desc()).all()
