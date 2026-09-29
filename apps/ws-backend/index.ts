import { WebSocketServer } from "ws";
import { verify, type JwtPayload } from "jsonwebtoken";
import { isAuthUser, JWT_SECRET } from "./src/config/auth.config";
import { prisma } from "@repo/db";
import type { SocketUser } from "./src/types/types";

const wss = new WebSocketServer({ port: 8080 });

const onlineUsers = new Map<string, SocketUser>();

wss.on("connection", async (socket, req) => {
  const parsedURL = new URL(req.url!, `http://${req.headers.host}`);
  const token = parsedURL.searchParams.get("token");

  if (!token) return socket.close();

  const decoded = verify(token, JWT_SECRET) as JwtPayload;
  if (!isAuthUser(decoded)) return socket.close();

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) return socket.close();

  onlineUsers.set(decoded.id, {
    id: user.id,
    username: user.username,
    email: user.email,
    socket,
  });

  wss.clients.forEach((socket) => {
    socket.send(
      JSON.stringify({
        type: "ONLINE_USERS",
        payload: {
          users: Array.from(onlineUsers),
        },
      }),
    );
  });

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      socket.send(
        JSON.stringify({
          message: "User Joined Successfully",
        }),
      );
    }
  });
});
