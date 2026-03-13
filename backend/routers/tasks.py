from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import models, schemas
from database import get_db

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)

def log_activity(db: Session, action: str, user_id: int):
    log = models.ActivityLog(action=action, user_id=user_id)
    db.add(log)
    db.commit()

@router.post("/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # employer creates it, we'll log it for the HR to see, but the actor is the employer
    # Since we don't have auth, we assume user_id=1 for the employer for the log
    hr_user = db.query(models.User).filter(models.User.id == task.assigned_to).first()
    hr_name = hr_user.name if hr_user else f"HR {task.assigned_to}"
    log_activity(db, f"Employer assigned task to {hr_name}: {task.title}", user_id=1) 
    
    return db_task

@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(assigned_to: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Task)
    if assigned_to:
        query = query.filter(models.Task.assigned_to == assigned_to)
    return query.all()

@router.patch("/{task_id}/start", response_model=schemas.TaskResponse)
def start_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.status = "In Progress"
    db.commit()
    db.refresh(db_task)
    
    hr_name = db_task.assignee.name if db_task.assignee else f"HR {db_task.assigned_to}"
    log_activity(db, f"🟢 {hr_name} started task: {db_task.title}", user_id=db_task.assigned_to)
    
    return db_task

@router.patch("/{task_id}/complete", response_model=schemas.TaskResponse)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.status = "Completed"
    db_task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    
    hr_name = db_task.assignee.name if db_task.assignee else f"HR {db_task.assigned_to}"
    log_activity(db, f"🟢 {hr_name} completed task: {db_task.title}", user_id=db_task.assigned_to)
    
    return db_task
