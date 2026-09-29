import type WebSocket from "ws";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface SocketUser {
  id: string;
  email: string;
  username: string;
  socket: WebSocket;
}
