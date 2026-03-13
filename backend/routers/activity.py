from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
import asyncio
import json

import models, schemas
from database import get_db

router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)

# Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass # ignore closed connections

manager = ConnectionManager()

@router.get("/", response_model=List[schemas.ActivityLogResponse])
def get_activity_feed(db: Session = Depends(get_db)):
    # Return latest 50 activities
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(50).all()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        # We can implement a simple polling inside the websocket to check for new db changes
        # Or better yet, we just broadcast whenever an action happens via a global manager.
        # For simplicity, we'll poll the DB every 2 seconds for new logs. Real apps might use Redis PubSub.
        last_id = 0
        latest_log = db.query(models.ActivityLog).order_by(models.ActivityLog.id.desc()).first()
        if latest_log:
            last_id = latest_log.id
            
        while True:
            # Re-query DB for new logs
            new_logs = db.query(models.ActivityLog).filter(models.ActivityLog.id > last_id).order_by(models.ActivityLog.id.asc()).all()
            for log in new_logs:
                await websocket.send_text(json.dumps({
                    "id": log.id,
                    "action": log.action,
                    "timestamp": log.timestamp.isoformat(),
                    "user_id": log.user_id
                }))
                last_id = log.id
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
