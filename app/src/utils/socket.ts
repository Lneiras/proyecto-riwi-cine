import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { redisSubscriber, SEAT_EVENT_CHANNEL } from "../config/redis";

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket conectado: ${socket.id}`);

    socket.on("join-function", (functionId: number) => {
      if (!Number.isInteger(functionId)) {
        return;
      }

      socket.join(`function:${functionId}`);
    });

    socket.on("leave-function", (functionId: number) => {
      if (!Number.isInteger(functionId)) {
        return;
      }

      socket.leave(`function:${functionId}`);
    });
  });

  return io;
}

export async function subscribeToSeatEvents(): Promise<void> {
  await redisSubscriber.subscribe(SEAT_EVENT_CHANNEL, (message) => {
    try {
      const event = JSON.parse(message);

      io.to(`function:${event.showtimeId}`).emit(event.type, event);
    } catch (error) {
      console.error("Error procesando evento:", error);
    }
  });
}