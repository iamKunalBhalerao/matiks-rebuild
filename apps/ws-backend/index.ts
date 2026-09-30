import WebSocket, { WebSocketServer } from "ws";
import { verify, type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./src/config/auth.config";
import { GameStatus, prisma } from "@repo/db";
import type { Game, Questions, SocketUser } from "./src/types/types";
import { generateQuestions } from "./src/utils/utils";

const wss = new WebSocketServer({ port: 8080 });

const onlineUsers = new Map<string, SocketUser>();
const games = new Map<string, Game>();
const currentQuestion = new Map<string, number>();
const allQuestions = new Map<string, Questions[]>();

type ExtendedWs = WebSocket & { userId: string };

wss.on("connection", async (socket: ExtendedWs, req) => {
  const parsedURL = new URL(req.url!, `http://${req.headers.host}`);
  const token = parsedURL.searchParams.get("token");

  if (!token) return socket.close();

  let decoded;

  try {
    decoded = verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    socket.close();
    return;
    // if (!isAuthUser(decoded)) return socket.close();
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) return socket.close();

  socket.userId = decoded.id;

  onlineUsers.set(decoded.id, {
    id: user.id,
    username: user.username,
    email: user.email,
    socket,
  });

  wss.clients.forEach((socketAll) => {
    socketAll.send(
      JSON.stringify({
        type: "ONLINE_USERS",
        payload: {
          users: Array.from(onlineUsers),
        },
      }),
    );
  });

  socket.on("message", (message) => {
    const parsedData = JSON.parse(message.toString());

    if (parsedData.type === "join") {
      socket.send(
        JSON.stringify({
          message: "User Joined Successfully",
        }),
      );
    }

    if (parsedData.type === "PLAY_GAME") {
      const {} = parsedData.payload;

      let runningGame: Game | null = null;

      for (const [gameId, game] of games.entries()) {
        if (game.status == GameStatus.SEARCHING_FOR_PLAYERS) {
          runningGame = game;
          break;
        }
      }

      if (!runningGame) {
        const gameId = crypto.randomUUID();

        games.set(gameId, {
          id: gameId,
          members: [
            {
              id: user.id,
              username: user.username,
              email: user.email,
              socket: socket,
            },
          ],
          adminId: user.id,
          status: GameStatus.SEARCHING_FOR_PLAYERS,
          questions: [],
          answers: [],
        });

        wss.clients.forEach((sockerAll) => {
          if (sockerAll == socket) return;
          sockerAll.send(
            JSON.stringify({
              type: "GAME_REQUEST",
              payload: { gameId },
            }),
          );
        });
      }

      const currentGame = games.get(runningGame!.id);

      currentGame?.members.push({
        id: user.id,
        username: user.username,
        email: user.email,
        socket: socket,
      });

      currentGame!.questions = generateQuestions();
      allQuestions.set(runningGame!.id, currentGame!.questions);
      currentGame!.status = GameStatus.RUNNING;

      games.set(currentGame!.id, currentGame!);

      const firstQ = currentGame?.questions[0];

      const key = `g:${currentGame?.id}-u:${user.id}-q:${firstQ}`;

      currentQuestion.set(key, 0);

      currentGame?.members.forEach((member) => {
        member.socket.send(
          JSON.stringify({
            type: "QUESTION",
            payload: {
              gameId: runningGame!.id,
              question: firstQ,
            },
          }),
        );
      });
    }

    if (parsedData.type === "SUBMIT_ANSWER") {
      const { gameId, questionId, answer } = parsedData.payload;

      const existingGame = games.get(gameId);

      if (!existingGame) {
        socket.close();
        return;
      }

      const existingQuestion = existingGame.questions.find((qs) => {
        qs.id == questionId;
      });

      if (!existingQuestion) {
        socket.close();
        return;
      }

      const filterAnswered = existingGame.answers.filter((exGm) => {
        exGm.questionId !== questionId;
      });

      filterAnswered.push({ answer, questionId });

      if (answer !== existingQuestion.sysAnswer) {
        return;
      }

      const key = `g:${existingGame?.id}-u:${user.id}-q:${existingQuestion.id}`;
      const currentQuestionIndex = currentQuestion.get(key)!;
      const storedQuestions = allQuestions.get(existingGame.id)!;

      const nextQuestion = storedQuestions[currentQuestionIndex + 1];
      currentQuestion.set(key, currentQuestionIndex + 1);

      socket.send(
        JSON.stringify({
          type: "QUESTION",
          payload: {
            gameId: gameId,
            questionId,
            answer,
          },
        }),
      );
    }
    //
  });
});
