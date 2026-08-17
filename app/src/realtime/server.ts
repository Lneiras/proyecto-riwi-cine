import { createServer } from "http";

import {
  initializeSocket,
  subscribeToSeatEvents,
} from "../utils/socket";

import { connectRedisSubscriber } from "../config/redis";

const PORT = process.env.SOCKET_PORT || 3001;

const startRealtimeServer = async () => {
  try {
    await connectRedisSubscriber(); //Conectamos el servidor realtime a Redis.

    const httpServer = createServer();

    initializeSocket(httpServer);

    await subscribeToSeatEvents();

    // escribimos initializeSocket antes que subscribeToSeatEvents()
    //Porque en ese segundo caso io todavía no estaría inicializado cuando empezamos a suscribirnos a los eventos.

    httpServer.listen(PORT, () => {
      console.log(
        `Servidor realtime escuchando en puerto ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Error al iniciar el servidor realtime:",
      error
    );

    process.exit(1);
  }
};

startRealtimeServer();