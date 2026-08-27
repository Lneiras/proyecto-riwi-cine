import { createClient } from "redis" //importamos la funcion creatClient de redis

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"; //le damos la url puerto que esta en .env que definimos para redis

export const redis = createClient({ url: redisUrl, }) //aqui definimos el cliente que va a crear

export const redisSubscriber = redis.duplicate()

export const redisCleanupSubscriber = redis.duplicate(); //lo usaremos para el job de seat-lock-cleanup exclusivamente


// ".on("error",..."
// OBLIGATORIO: Previene que Node.js colapse si la conexión TCP con Redis se cae.
// En Node.js, si Redis emite un evento "error" y no hay un listener escuchándolo,
// el proceso se destruye inmediatamente (crash). Este bloque lo mantiene vivo.
// basicamente evita que el servidor colapse si la red falla; permite la reconexión automática en segundo plano.
redis.on("error", (error) => {
  console.error("Redis error:", error);
});

redisSubscriber.on("error", (error) => {
  console.error("Redis subscriber error:", error);
});

redisCleanupSubscriber.on("error", (error) => {
  console.error("Redis cleanup subscriber error:", error);
});

//estas son constantes de configuración utilizadas para organizar las llaves y
// la comunicación en Redis de forma limpia y prevenir errores de escritura en el código.
// ya que redis guarda por clave valor

export const SEAT_LOCK_PREFIX = "cine:seat-lock"; //prefijo de llaves
//En lugar de crear una llave con un nombre genérico como funcion10:asiento5, la guardas como cine:seat-lock:funcion10:asiento5. 
// Evita que sobrescribas accidentalmente otra información alojada en el mismo servidor de Redis.

export const SEAT_EVENT_CHANNEL = "cine:seat-events"; // esto es el canal de transmision pub
export const CART_PREFIX = "cine:cart:user";
export const GIFT_CARD_LOCK_PREFIX = "cine:gift-card-lock";
//Redis incluye un sistema de mensajería llamado Pub/Sub (Publicar/Suscribir), similar a una frecuencia de radio. 
// Este es el nombre del canal por donde tu servidor grita eventos cuando cambia el estado de un asiento 
// (por ejemplo: "Se bloqueó la silla 12"). Los WebSockets se suscriben a este canal para escuchar los cambios y 
// enviárselos a los usuarios en tiempo real.

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }

  try {
    await redis.configSet(
      "notify-keyspace-events",
      "Ex"
    );

    console.log(
      "Redis key expiration events habilitados."
    );
  } catch (error) {
    console.warn(
      "No se pudieron habilitar los keyspace notifications. " +
        "El fallback periódico seguirá funcionando.",
      error
    );
  }

  console.log("Conexión de Redis principal establecida...");
}

export async function connectRedisSubscriber() {
  if (!redisSubscriber.isOpen) {
    await redisSubscriber.connect();
  }

  console.log("Conexión del Redis subscriber establecida...");
}


