import type { GameStatus, OperationSign } from "@repo/db";
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

export type Questions = {
  id?: number;
  // sysAnswer: number;
  operant1: number;
  operant2: number;
  operation: OperationSign;
  sysAnswer: number;
};

export type Answers = {
  id?: number;
  answer: number;
  questionId: number;
};

export interface Game {
  id: string;
  members: SocketUser[];
  adminId: string;
  status: GameStatus;
  questions: Questions[];
  answers: Answers[];
}
