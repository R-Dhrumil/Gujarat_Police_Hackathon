from typing import List, Dict, Any
import json
from fastapi import WebSocket, WebSocketDisconnect

class AlertConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WEBSOCKET] Client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WEBSOCKET] Client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast_alert(self, alert_data: Dict[str, Any]):
        """Broadcasts real-time alert payload to all connected command center clients"""
        if not self.active_connections:
            return

        message = json.dumps({
            "type": "NEW_ALERT",
            "data": alert_data
        }, default=str)

        disconnected_clients = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected_clients.append(connection)

        for client in disconnected_clients:
            self.disconnect(client)

    async def broadcast_health_update(self, camera_health_data: Dict[str, Any]):
        """Broadcasts camera stream health status changes (e.g. offline/reconnected)"""
        if not self.active_connections:
            return

        message = json.dumps({
            "type": "CAMERA_HEALTH_UPDATE",
            "data": camera_health_data
        }, default=str)

        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                pass

alert_manager = AlertConnectionManager()
