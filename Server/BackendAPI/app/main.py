from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import openai
import os

# Set your OpenAI API key
openai.api_key = "your api key"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # can be restricted to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def get():
    return "Welcome Home"

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            now = datetime.now()
            current_time = now.strftime("%H:%M")

            # Send user message to all clients (including the one who sent it)
            user_message = {"time": current_time, "role": "user", "message": data}
            await manager.broadcast(json.dumps(user_message))

            # Call OpenAI API to get the response
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": data},
                ]
            )
            answer = response.choices[0].message['content'].strip()

            assistant_message = {"time": current_time, "role": "assistant", "message": answer}
            await manager.broadcast(json.dumps(assistant_message))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        disconnect_message = {"time": current_time, "role": "system", "message": "User disconnected"}
        await manager.broadcast(json.dumps(disconnect_message))
