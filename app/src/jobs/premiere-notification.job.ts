// app/src/jobs/premiere-notification.job.ts

/**
 * Job de Notificaciones de Estreno (HU-005 Task 2)
 * -------------------------------------------------
 * Simula un cron/scheduler que periódicamente detecta suscripciones
 * pendientes (notifiedAt IS NULL) cuya película ya está en cartelera
 * (estado "publicada") y "envía" la notificación marcando notifiedAt.
 *
 * En un sistema real aquí se integraría el canal de entrega (email, push,
 * cola de mensajes). Por ahora el "envío" queda registrado en el log y la
 * suscripción queda marcada para no notificar dos veces (Escenario 3).
 */

import UpcomingMovieRepository from "../repositories/upcoming-movie.repository";

const PUBLISHED_STATUS = "publicada";

export interface PremiereNotificationJobResult {
  processed: number;
  notifiedAt: Date;
}

export class PremiereNotificationJob {
  private timer?: NodeJS.Timeout;
  private readonly intervalMs: number;

  constructor(intervalMs: number = 60 * 60 * 1000) {
    this.intervalMs = intervalMs;
  }

  /** Ejecuta una pasada del job. Idempotente: solo marca pendientes. */
  async run(): Promise<PremiereNotificationJobResult> {
    const pending = await UpcomingMovieRepository.findPendingNotifications(PUBLISHED_STATUS);
    if (pending.length === 0) return { processed: 0, notifiedAt: new Date() };

    const ids = pending.map((n) => n.id);
    const notifiedAt = new Date();
    await UpcomingMovieRepository.markAsNotified(ids, notifiedAt);

    console.log(
      `[job:premiereNotifications] Enviadas ${ids.length} notificaciones de estreno (películas ya en cartelera).`
    );
    return { processed: ids.length, notifiedAt };
  }

  /** Inicia el job con intervalo configurable (solo en el entrypoint). */
  start(): void {
    if (this.timer) return;
    // Primera pasada a los pocos segundos de arrancar, luego en cada intervalo.
    const runOnce = () => {
      this.run().catch((err) => {
        console.error("[job:premiereNotifications] Error ejecutando el job:", err);
      });
    };
    this.timer = setTimeout(() => {
      runOnce();
      this.timer = setInterval(runOnce, this.intervalMs);
    }, 5000);
  }

  /** Detiene el job (útil en tests). */
  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}

export default new PremiereNotificationJob();
