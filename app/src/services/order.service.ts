import { Op } from "sequelize";

import sequelize from "../config/database";

import {
  Payment,
  Product,
  Reservation,
  ReservationEntry,
  ReservationProduct,
  SeatLock,
  Showtime,
} from "../models";

import MembershipService from "./membership.service";

import {
  CreateOrderDto,
} from "../dto/order.dto";

class OrderService {

  async createOrder(
    userId: number,
    data: CreateOrderDto
  ) {
    return sequelize.transaction(
      async (transaction) => {

        const showtime =
          await Showtime.findByPk(
            data.showtimeId,
            { transaction }
          );

        if (!showtime) {
          throw new Error(
            "Función no encontrada"
          );
        }

        /*
         * 1. Verificar que los locks
         * todavía pertenecen al usuario.
         */
        const locks =
          await SeatLock.findAll({
            where: {
              showtimeId:
                data.showtimeId,

              seatId: {
                [Op.in]:
                  data.seatIds,
              },

              userId,

              status: "active",

              expiresAt: {
                [Op.gt]: new Date(),
              },
            },

            transaction,

            lock:
              transaction.LOCK.UPDATE,
          });

        if (
          locks.length !==
          data.seatIds.length
        ) {
          throw new Error(
            "Uno o más asientos ya no están bloqueados para este usuario o ya expiraron"
          );
        }

        /*
         * 2. Volver a comprobar que no
         * estén vendidos.
         */
        const soldEntries =
          await ReservationEntry.findAll({
            where: {
              showtimeId:
                data.showtimeId,

              seatId: {
                [Op.in]:
                  data.seatIds,
              },
            },

            include: [
              {
                model: Reservation,

                where: {
                  status: "Pagada",
                },

                attributes: [],
              },
            ],

            transaction,
          });

        if (soldEntries.length > 0) {
          throw new Error(
            `El asiento ${soldEntries[0].seatId} ya fue vendido`
          );
        }

        /*
         * 3. Buscar una reserva pendiente
         * que ya tenga una de estas sillas.
         *
         * Esto permite reutilizar el carrito
         * después de un rechazo.
         */
        let reservation:
          | Reservation
          | null = null;

        for (
          const seatId
          of data.seatIds
        ) {

          const existingEntry =
            await ReservationEntry.findOne({
              where: {
                showtimeId:
                  data.showtimeId,

                seatId,
              },

              include: [
                {
                  model: Reservation,
                  required: true,
                },
              ],

              transaction,

              lock:
                transaction.LOCK.UPDATE,
            });

          if (!existingEntry) {
            continue;
          }

          const existingReservation =
            await Reservation.findByPk(
              existingEntry.reservationId,
              {
                transaction,
                lock:
                  transaction.LOCK.UPDATE,
              }
            );

          if (!existingReservation) {
            continue;
          }

          if (
            existingReservation.status ===
            "Pagada"
          ) {
            throw new Error(
              `El asiento ${seatId} ya fue vendido`
            );
          }

          if (
            existingReservation.status ===
            "Pendiente"
          ) {

            const approvedPayment =
              await Payment.findOne({
                where: {
                  reservationId:
                    existingReservation.id,

                  status: "Aprobado",
                },

                transaction,
              });

            if (approvedPayment) {
              throw new Error(
                "La reserva ya tiene un pago aprobado y está pendiente de confirmación"
              );
            }

            if (
              existingReservation.userId ===
              userId
            ) {
              reservation =
                existingReservation;
            } else {

              /*
               * La línea es de una reserva
               * pendiente vieja cuyo lock
               * ya expiró.
               */
              await existingEntry.destroy({
                transaction,
              });
            }
          }
        }

        /*
         * 4. Crear reserva nueva
         * o reutilizar carrito pendiente.
         */
        if (!reservation) {

          reservation =
            await Reservation.create(
              {
                userId,
                total: 0,
                status: "Pendiente",
              },
              { transaction }
            );

        } else {

          await ReservationEntry.destroy({
            where: {
              reservationId:
                reservation.id,
            },

            transaction,
          });

          await ReservationProduct.destroy({
            where: {
              reservationId:
                reservation.id,
            },

            transaction,
          });
        }

        /*
         * 5. Calcular subtotal de entradas.
         */
        const ticketAmount =
          data.seatIds.length *
          Number(showtime.basePrice);

        /*
         * 6. Guardar las entradas
         * de la reserva.
         */
        for (
          const seatId
          of data.seatIds
        ) {

          await ReservationEntry.create(
            {
              reservationId:
                reservation.id,

              showtimeId:
                data.showtimeId,

              seatId,

              unitPrice:
                Number(
                  showtime.basePrice
                ),
            },

            { transaction }
          );
        }

        /*
         * 7. Productos.
         */
        const products =
          data.products ?? [];

        const productIds =
          products.map(
            (item) =>
              item.productId
          );

        const uniqueProductIds =
          [...new Set(productIds)];

        const productRows =
          uniqueProductIds.length
            ? await Product.findAll({
                where: {
                  id: {
                    [Op.in]:
                      uniqueProductIds,
                  },
                },

                transaction,

                lock:
                  transaction.LOCK.UPDATE,
              })
            : [];

        const productById =
          new Map(
            productRows.map(
              (product) => [
                product.id,
                product,
              ]
            )
          );

        let snackAmount = 0;

        for (
          const item
          of products
        ) {

          const product =
            productById.get(
              item.productId
            );

          if (!product) {
            throw new Error(
              `El producto ${item.productId} no existe`
            );
          }

          if (
            product.stock <
            item.quantity
          ) {
            throw new Error(
              `Stock insuficiente para el producto ${product.name}`
            );
          }

          const subtotal =
            Number(product.price) *
            item.quantity;

          snackAmount += subtotal;

          await ReservationProduct.create(
            {
              reservationId:
                reservation.id,

              productId:
                product.id,

              quantity:
                item.quantity,

              unitPrice:
                Number(product.price),

              subtotal,
            },

            { transaction }
          );
        }

        /*
         * 8. AQUÍ reutilizamos
         * calculate-discount.
         */
        const discount =
          await MembershipService.calculateDiscount(
            userId,
            {
              ticketAmount,
              snackAmount,
            }
          );

        /*
         * 9. Guardamos el TOTAL FINAL.
         */
        await reservation.update(
          {
            total:
              discount.grandTotal,
          },

          { transaction }
        );

        return {
          reservationId:
            reservation.id,

          showtimeId:
            data.showtimeId,

          seatIds:
            data.seatIds,

          expiresAt:
            locks[0].expiresAt,

          subtotal:
            Number(
              discount.ticketSubtotal +
              discount.snackSubtotal
            ),

          ticketDiscount:
            discount.ticketDiscountAmount,

          snackDiscount:
            discount.snackDiscountAmount,

          discount:
            Number(
              discount.ticketDiscountAmount +
              discount.snackDiscountAmount
            ),

          total:
            discount.grandTotal,
        };
      }
    );
  }
}

export default new OrderService();