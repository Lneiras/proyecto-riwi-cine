import "dotenv/config";

import sequelize from "../config/database";
import "../models";

import {
  redis,
  SEAT_LOCK_PREFIX,
} from "../config/redis";

import {
  Product,
  Reservation,
  ReservationEntry,
  ReservationProduct,
  Payment,
  Ticket,
  AuditLog,
  SeatLock,
  Showtime,
  Seat,
} from "../models";

import seatService
  from "../services/seat.service";

import orderService
  from "../services/order.service";

import paymentService
  from "../services/payment.service";

describe(
  "HU-013 - flujo de pago",
  () => {

    let showtimeId: number;
    let seatId: number;

    let product: Product | null;

    let originalStock = 0;

    beforeAll(async () => {

      await sequelize.authenticate();

      await sequelize.sync({
        alter: true,
      });

      if (!redis.isOpen) {
        await redis.connect();
      }

      const showtime =
        await Showtime.findOne();

      if (!showtime) {
        throw new Error(
          "No existe una función para probar HU-013"
        );
      }

      showtimeId =
        showtime.id;

      const seat =
        await Seat.findOne({
          where: {
            roomId:
              showtime.roomId,

            status:
              "available",
          },
        });

      if (!seat) {
        throw new Error(
          "No existe asiento disponible"
        );
      }

      seatId =
        seat.id;

      product =
        await Product.findOne();

      if (product) {
        originalStock =
          product.stock;
      }
    });

    afterEach(async () => {

      const reservations =
        await Reservation.findAll({
          where: {
            userId:
              [1, 2] as any,
          },
        });

      for (
        const reservation
        of reservations
      ) {

        const entries =
          await ReservationEntry.findAll({
            where: {
              reservationId:
                reservation.id,
            },
          });

        for (
          const entry
          of entries
        ) {

          await Ticket.destroy({
            where: {
              reservationEntryId:
                entry.id,
            },
          });
        }

        await ReservationProduct.destroy({
          where: {
            reservationId:
              reservation.id,
          },
        });

        await Payment.destroy({
          where: {
            reservationId:
              reservation.id,
          },
        });

        await AuditLog.destroy({
          where: {
            entity:
              "reservation",

            entityId:
              reservation.id,
          },
        });

        await ReservationEntry.destroy({
          where: {
            reservationId:
              reservation.id,
          },
        });

        await Reservation.destroy({
          where: {
            id:
              reservation.id,
          },
        });
      }

      await SeatLock.destroy({
        where: {
          showtimeId,
          seatId,
        },
      });

      await redis.del(
        `${SEAT_LOCK_PREFIX}:${showtimeId}:${seatId}`
      );

      if (product) {
        await product.reload();

        await product.update({
          stock:
            originalStock,
        });
      }
    });

    afterAll(async () => {

      if (redis.isOpen) {
        await redis.quit();
      }

      await sequelize.close();
    });

    it(
      "Scenario 1: pago aprobado confirma la compra",
      async () => {

        await seatService.lockSeats(
          showtimeId,
          [seatId],
          1
        );

        const order =
          await orderService.createOrder(
            1,
            {
              showtimeId,

              seatIds: [
                seatId,
              ],

              products:
                product
                  ? [
                      {
                        productId:
                          product.id,

                        quantity: 1,
                      },
                    ]
                  : [],
            }
          );

        const payment =
          await paymentService.createPayment(
            1,
            {
              reservationId:
                order.reservationId,

              paymentMethod:
                "nequi",

              paymentToken:
                "tok_test_approved",
            }
          );

        expect(
          payment.status
        ).toBe("approved");

        const webhook =
          await paymentService
            .processWebhook(
              payment.transactionReference,
              "approved"
            );

        expect(
          webhook.status
        ).toBe("approved");

        const reservation =
          await Reservation.findByPk(
            order.reservationId
          );

        expect(
          reservation?.status
        ).toBe("Pagada");

        const tickets =
          await Ticket.findAll({
            include: [
              {
                model:
                  ReservationEntry,

                where: {
                  reservationId:
                    order.reservationId,
                },
              },
            ],
          });

        expect(
          tickets
        ).toHaveLength(1);

        if (product) {

          await product.reload();

          expect(
            product.stock
          ).toBe(
            originalStock - 1
          );
        }
      }
    );

    it(
      "Scenario 2: pago rechazado libera las sillas",
      async () => {

        await seatService.lockSeats(
          showtimeId,
          [seatId],
          1
        );

        const order =
          await orderService.createOrder(
            1,
            {
              showtimeId,

              seatIds: [
                seatId,
              ],
            }
          );

        const payment =
          await paymentService.createPayment(
            1,
            {
              reservationId:
                order.reservationId,

              paymentMethod:
                "nequi",

              paymentToken:
                "reject",
            }
          );

        expect(
          payment.status
        ).toBe("rejected");

        const reservation =
          await Reservation.findByPk(
            order.reservationId
          );

        expect(
          reservation?.status
        ).toBe("Pendiente");

        const lock =
          await SeatLock.findOne({
            where: {
              showtimeId,
              seatId,
              status:
                "active",
            },
          });

        expect(
          lock
        ).toBeNull();
      }
    );

    it(
      "Scenario 3: webhook duplicado es idempotente",
      async () => {

        await seatService.lockSeats(
          showtimeId,
          [seatId],
          1
        );

        const order =
          await orderService.createOrder(
            1,
            {
              showtimeId,
              seatIds: [
                seatId,
              ],
            }
          );

        const payment =
          await paymentService.createPayment(
            1,
            {
              reservationId:
                order.reservationId,

              paymentMethod:
                "pse",

              paymentToken:
                "tok_test_approved",
            }
          );

        const first =
          await paymentService
            .processWebhook(
              payment.transactionReference,
              "approved"
            );

        const second =
          await paymentService
            .processWebhook(
              payment.transactionReference,
              "approved"
            );

        expect(
          first.idempotent
        ).toBe(false);

        expect(
          second.idempotent
        ).toBe(true);

        const tickets =
          await Ticket.count({
            include: [
              {
                model:
                  ReservationEntry,

                where: {
                  reservationId:
                    order.reservationId,
                },
              },
            ],
          });

        expect(
          tickets
        ).toBe(1);
      }
    );

    it(
      "Scenario 4: lock expirado antes del webhook no confirma la compra",
      async () => {

        await seatService.lockSeats(
          showtimeId,
          [seatId],
          1
        );

        const order =
          await orderService.createOrder(
            1,
            {
              showtimeId,
              seatIds: [
                seatId,
              ],
            }
          );

        const payment =
          await paymentService.createPayment(
            1,
            {
              reservationId:
                order.reservationId,

              paymentMethod:
                "card",

              paymentToken:
                "tok_test_approved",
            }
          );

        await SeatLock.update(
          {
            expiresAt:
              new Date(
                Date.now() - 1000
              ),
          },
          {
            where: {
              showtimeId,
              seatId,
              userId: 1,
            },
          }
        );

        const webhook =
          await paymentService
            .processWebhook(
              payment.transactionReference,
              "approved"
            );

        expect(
          webhook.status
        ).toBe("rejected");

        const reservation =
          await Reservation.findByPk(
            order.reservationId
          );

        expect(
          reservation?.status
        ).toBe("Pendiente");
      }
    );

    it(
      "Task 5: timeout libera las sillas",
      async () => {

        await seatService.lockSeats(
          showtimeId,
          [seatId],
          1
        );

        const order =
          await orderService.createOrder(
            1,
            {
              showtimeId,
              seatIds: [
                seatId,
              ],
            }
          );

        const payment =
          await paymentService.createPayment(
            1,
            {
              reservationId:
                order.reservationId,

              paymentMethod:
                "daviplata",

              paymentToken:
                "timeout",
            }
          );

        expect(
          payment.status
        ).toBe("timeout");

        const lock =
          await SeatLock.findOne({
            where: {
              showtimeId,
              seatId,
              status:
                "active",
            },
          });

        expect(
          lock
        ).toBeNull();
      }
    );
  }
);