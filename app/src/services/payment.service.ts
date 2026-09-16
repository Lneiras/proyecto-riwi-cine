import { Op } from "sequelize";

import sequelize from "../config/database";

import {
  AuditLog,
  Payment,
  Product,
  Reservation,
  ReservationEntry,
  ReservationProduct,
  SeatLock,
  Ticket,
} from "../models";

import {
  redis,
  SEAT_LOCK_PREFIX,
} from "../config/redis";

import seatService from "./seat.service";

import paymentRepository from
  "../repositories/payment.repository";

import mockPaymentGateway from
  "../gateways/mock-payment.gateway";

import cartRepository from
  "../repositories/cart.repository";

import {
  CreatePaymentDto,
} from "../dto/payment.dto";

import {
  generateQrIdentifier,
} from "../utils/qrIdentifierGenerator";



class PaymentService {

  private getRedisKey(
    showtimeId: number,
    seatId: number
  ): string {
    return `${SEAT_LOCK_PREFIX}:${showtimeId}:${seatId}`;
  }

  private async deleteRedisLock(
    showtimeId: number,
    seatId: number,
    lockToken: string,
    userId: number
  ) {

    const key =
      this.getRedisKey(
        showtimeId,
        seatId
      );

    const value =
      `${userId}:${lockToken}`;

    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1]
      then
        return redis.call("DEL", KEYS[1])
      end
      return 0
    `;

    await redis.eval(
      script,
      {
        keys: [key],
        arguments: [value],
      }
    );
  }

  async createPayment(
    userId: number,
    data: CreatePaymentDto
  ) {

    const reservation =
      await Reservation.findOne({
        where: {
          id: data.reservationId,
          userId,
        },
      });

    if (!reservation) {
      throw new Error(
        "Reserva no encontrada"
      );
    }

    if (
      reservation.status !==
      "Pendiente"
    ) {
      throw new Error(
        "La reserva ya no está pendiente"
      );
    }

    const entries =
      await ReservationEntry.findAll({
        where: {
          reservationId:
            reservation.id,
        },
      });

    if (entries.length === 0) {
      throw new Error(
        "La reserva no tiene entradas"
      );
    }

    /*
     * Si ya existe un pago aprobado,
     * no volvemos a cobrar.
     */
    const approvedPayment =
      await paymentRepository
        .findApprovedByReservationId(
          reservation.id
        );

    if (approvedPayment) {

      return {
        reservationId:
          reservation.id,

        transactionReference:
          approvedPayment.transactionReference,

        status:
          "approved",

        amount:
          Number(
            approvedPayment.amount
          ),

        message:
          "El pago ya fue iniciado para esta reserva; espera el webhook de confirmación.",
      };
    }

    /*
     * Volvemos a comprobar los locks.
     */
    const locks =
      await SeatLock.findAll({
        where: {
          showtimeId: {
            [Op.in]:
              entries.map(
                (entry) =>
                  entry.showtimeId
              ),
          },

          seatId: {
            [Op.in]:
              entries.map(
                (entry) =>
                  entry.seatId
              ),
          },

          userId,

          status: "active",

          expiresAt: {
            [Op.gt]:
              new Date(),
          },
        },
      });

    if (
      locks.length !==
      entries.length
    ) {
      throw new Error(
        "Una o más sillas expiraron antes del pago"
      );
    }

    /*
     * Llamamos a nuestra pasarela.
     */
    const response =
      await mockPaymentGateway.charge({
        amount:
          Number(
            reservation.total
          ),

        paymentMethod:
          data.paymentMethod,

        paymentToken:
          data.paymentToken,
      });

    /*
     * TIMEOUT
     */
    if (
      response.status ===
      "timeout"
    ) {

      await paymentRepository.create({
        reservationId:
          reservation.id,

        paymentMethod:
          data.paymentMethod,

        transactionReference:
          response.transactionReference,

        amount:
          Number(
            reservation.total
          ),

        status:
          "Rechazado",
      });

      await this
        .releaseReservationSeats(
          userId,
          reservation.id
        );

      return {
        reservationId:
          reservation.id,

        transactionReference:
          response.transactionReference,

        status:
          "timeout",

        message:
          response.rejectionReason,
      };
    }

    const paymentStatus =
      response.status ===
      "approved"
        ? "Aprobado"
        : "Rechazado";

    /*
     * Guardamos el resultado del intento.
     */
    await paymentRepository.create({
      reservationId:
        reservation.id,

      paymentMethod:
        data.paymentMethod,

      transactionReference:
        response.transactionReference,

      amount:
        Number(
          reservation.total
        ),

      status:
        paymentStatus,
    });

    /*
     * RECHAZADO
     */
    if (
      response.status ===
      "rejected"
    ) {

      await this
        .releaseReservationSeats(
          userId,
          reservation.id
        );
    }

    return {
      reservationId:
        reservation.id,

      transactionReference:
        response.transactionReference,

      status:
        response.status,

      amount:
        Number(
          reservation.total
        ),

      rejectionReason:
        response.rejectionReason,

      message:
        response.status ===
        "approved"
          ? "Pago autorizado. La compra se confirmará al procesar el webhook."
          : "Pago rechazado. La reserva permanece activa y las sillas fueron liberadas.",
    };
  }

  async createPaymentFromCart(
  userId: number,
  data: CreatePaymentDto
) {
  const cart =
    await cartRepository.find(
      userId
    );

  if (!cart) {
    throw new Error(
      "No existe un carrito activo"
    );
  }

  if (
    !cart.checkoutReservationId
  ) {
    throw new Error(
      "Primero debes iniciar el checkout del carrito"
    );
  }

  if (
    cart.checkoutReservationId !==
    data.reservationId
  ) {
    throw new Error(
      "La reserva no corresponde al checkout actual"
    );
  }

  return this.createPayment(
    userId,
    data
  );
}

  async getStatus(
    userId: number,
    transactionReference: string
  ) {

    const payment =
      await Payment.findOne({
        where: {
          transactionReference,
        },

        include: [
          {
            model: Reservation,
            where: {
              userId,
            },
          },
        ],
      });

    if (!payment) {
      throw new Error(
        "Pago no encontrado"
      );
    }

    return {
      transactionReference:
        payment.transactionReference,

      reservationId:
        payment.reservationId,

      amount:
        Number(payment.amount),

      status:
        payment.status,

      paymentDate:
        payment.paymentDate,
    };
  }

  async processWebhook(
    transactionReference: string,
    status:
      | "approved"
      | "rejected"
  ) {

    const payment =
      await paymentRepository
        .findByTransactionReference(
          transactionReference
        );

    if (!payment) {
      throw new Error(
        "Transacción no encontrada"
      );
    }

    const reservation =
      await Reservation.findByPk(
        payment.reservationId
      );

    if (!reservation) {
      throw new Error(
        "Reserva asociada no encontrada"
      );
    }

    /*
     * IDPOTENCIA
     *
     * Si ya está Pagada,
     * este webhook ya se procesó.
     */
    if (
      reservation.status ===
      "Pagada"
    ) {

      return {
        idempotent: true,

        reservationId:
          reservation.id,

        transactionReference,
      };
    }

    /*
     * Webhook rechazado.
     */
    if (
      status ===
      "rejected"
    ) {

      await payment.update({
        status:
          "Rechazado",
      });

      await this
        .releaseReservationSeats(
          reservation.userId,
          reservation.id
        );

      return {
        idempotent: false,

        reservationId:
          reservation.id,

        status:
          "rejected",
      };
    }

    if (
      payment.status !==
      "Aprobado"
    ) {
      throw new Error(
        "El pago no está aprobado por la pasarela"
      );
    }

    /*
     * TODA LA CONFIRMACIÓN
     * OCURRE DENTRO DE UNA
     * TRANSACTION DE SEQUELIZE.
     */
    try {

      const result =
        await sequelize.transaction(
          async (transaction) => {

            /*
             * Bloqueamos la reserva.
             */
            const lockedReservation =
              await Reservation.findByPk(
                reservation.id,
                {
                  transaction,

                  lock:
                    transaction.LOCK.UPDATE,
                }
              );

            if (!lockedReservation) {
              throw new Error(
                "Reserva no encontrada"
              );
            }

            if (
              lockedReservation.status ===
              "Pagada"
            ) {

              return {
                idempotent: true,

                reservationId:
                  lockedReservation.id,

                lockTokens: [], //aqui nos aseguramos que nunca sea undefined
              };
            }

            if (
              lockedReservation.status !==
              "Pendiente"
            ) {
              throw new Error(
                "La reserva ya no puede ser pagada"
              );
            }

            /*
             * Entradas de la reserva.
             */
            const entries =
              await ReservationEntry.findAll({
                where: {
                  reservationId:
                    lockedReservation.id,
                },

                transaction,
              });

            if (
              entries.length === 0
            ) {
              throw new Error(
                "La reserva no tiene entradas"
              );
            }

            /*
             * VALIDACIÓN FINAL
             * DE DISPONIBILIDAD.
             */
            const lockTokens: Array<{
              showtimeId: number;
              seatId: number;
              userId: number;
              lockToken: string;
            }> = [];

            for (
              const entry
              of entries
            ) {

              const lock =
                await SeatLock.findOne({
                  where: {
                    showtimeId:
                      entry.showtimeId,

                    seatId:
                      entry.seatId,

                    userId:
                      lockedReservation.userId,

                    status:
                      "active",
                  },

                  transaction,

                  lock:
                    transaction.LOCK.UPDATE,
                });

              if (
                !lock ||
                lock.expiresAt.getTime() <=
                  Date.now()
              ) {

                throw new Error(
                  "Una silla bloqueada expiró antes de confirmar el pago"
                );
              }

              lockTokens.push({
                showtimeId:
                  lock.showtimeId,

                seatId:
                  lock.seatId,

                userId:
                  lock.userId,

                lockToken:
                  lock.lockToken,
              });
            }

            /*
             * STOCK
             */
            const reservationProducts =
              await ReservationProduct.findAll({
                where: {
                  reservationId:
                    lockedReservation.id,
                },

                transaction,
              });

            for (
              const line
              of reservationProducts
            ) {

              const product =
                await Product.findByPk(
                  line.productId,
                  {
                    transaction,

                    lock:
                      transaction.LOCK.UPDATE,
                  }
                );

              if (!product) {
                throw new Error(
                  `El producto ${line.productId} ya no existe`
                );
              }

              if (
                product.stock <
                line.quantity
              ) {

                throw new Error(
                  `Stock insuficiente para el producto ${product.name}`
                );
              }

              await product.update(
                {
                  stock:
                    product.stock -
                    line.quantity,
                },

                { transaction }
              );
            }

            /*
             * CREAR ENTRADAS
             */
            for (
              const entry
              of entries
            ) {

              const existingTicket =
                await Ticket.findOne({
                  where: {
                    reservationEntryId:
                      entry.id,
                  },

                  transaction,
                });

              if (!existingTicket) {

                await Ticket.create(
                  {
                    reservationEntryId:
                      entry.id,

                    qrCode:
                      generateQrIdentifier(),

                    status:
                      "valida",

                    currentHolderId:
                      lockedReservation.userId,
                  },

                  { transaction }
                );
              }
            }

            /*
             * ASIENTOS → CONFIRMADOS
             */
            for (
              const lock
              of lockTokens
            ) {

              await SeatLock.update(
                {
                  status:
                    "confirmed",
                },

                {
                  where: {
                    showtimeId:
                      lock.showtimeId,

                    seatId:
                      lock.seatId,

                    userId:
                      lock.userId,

                    status:
                      "active",
                  },

                  transaction,
                }
              );
            }

            /*
             * RESERVA → PAGADA
             */
            await lockedReservation.update(
              {
                status:
                  "Pagada",
              },

              { transaction }
            );

            /*
             * AUDITORÍA
             */
            await AuditLog.create(
              {
                userId:
                  lockedReservation.userId,

                action:
                  "payment_confirmed",

                entity:
                  "reservation",

                entityId:
                  lockedReservation.id,

                ipAddress:
                  null,

                detail: {
                  transactionReference,

                  amount:
                    Number(
                      payment.amount
                    ),

                  entries:
                    entries.length,
                },
              },

              { transaction }
            );

            return {
              idempotent:
                false,

              reservationId:
                lockedReservation.id,

              lockTokens,
            };
          }
        );

      /*
       * PostgreSQL ya hizo COMMIT.
       *
       * Ahora eliminamos Redis.
       */
      if (!result.idempotent) {

        for (
          const lock
          of result.lockTokens
        ) {

          await this.deleteRedisLock(
            lock.showtimeId,
            lock.seatId,
            lock.lockToken,
            lock.userId
          );
        }
      }

      return {
        idempotent:
          result.idempotent,

        reservationId:
          result.reservationId,

        status:
          "approved",
      };

    } catch (error) {

      /*
       * Si algo falló durante la
       * confirmación, NO quedó una
       * compra a medias.
       */
      const reason =
        error instanceof Error
          ? error.message
          : "No fue posible confirmar el pago";

      await payment.update({
        status:
          "Rechazado",
      });

      await this
        .releaseReservationSeats(
          reservation.userId,
          reservation.id
        );

      return {
        idempotent: false,

        reservationId:
          reservation.id,

        status:
          "rejected",

        reason,
      };
    }
  }

  private async releaseReservationSeats(
    userId: number,
    reservationId: number
  ) {

    const entries =
      await ReservationEntry.findAll({
        where: {
          reservationId,
        },
      });

    const grouped =
      new Map<number, number[]>();

    for (
      const entry
      of entries
    ) {

      const list =
        grouped.get(
          entry.showtimeId
        ) ?? [];

      list.push(
        entry.seatId
      );

      grouped.set(
        entry.showtimeId,
        list
      );
    }

    for (
      const [
        showtimeId,
        seatIds,
      ] of grouped
    ) {

      await seatService.releaseSeats(
        showtimeId,
        seatIds,
        userId
      );
    }
  }
}

export default new PaymentService();