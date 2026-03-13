from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
import json
import asyncio
import datetime

import models
from database import get_db, SessionLocal

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

# WebSocket chat manager
class ChatManager:
    def __init__(self):
        self.active_connections: dict = {}  # user_id -> websocket

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except:
                pass

    async def broadcast(self, message: dict):
        for uid, ws in self.active_connections.items():
            try:
                await ws.send_text(json.dumps(message))
            except:
                pass

chat_manager = ChatManager()

# In-memory message store (simple for demo, resets on restart)
chat_messages = []

@router.get("/messages")
def get_messages():
    """Return all chat messages"""
    return chat_messages[-100:]  # last 100 messages

@router.websocket("/ws/{user_id}")
async def chat_websocket(websocket: WebSocket, user_id: int):
    await chat_manager.connect(websocket, user_id)
    
    # Look up user name
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.id == user_id).first()
    user_name = user.name if user else f"User {user_id}"
    user_role = user.role if user else "unknown"
    db.close()

    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            
            message = {
                "id": len(chat_messages) + 1,
                "user_id": user_id,
                "user_name": user_name,
                "user_role": user_role,
                "text": msg_data.get("text", ""),
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
            
            chat_messages.append(message)
            
            # Broadcast to all connected users
            await chat_manager.broadcast(message)
            
    except WebSocketDisconnect:
        chat_manager.disconnect(user_id)
