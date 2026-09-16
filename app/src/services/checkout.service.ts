import {
  Op,
} from "sequelize";

import sequelize from "../config/database";

import {
  CartData,
} from "../repositories/cart.repository";

import cartRepository from
  "../repositories/cart.repository";

import {
  Membership,
  Reservation,
  ReservationEntry,
  ReservationProduct,
  SeatLock,
  Showtime,
  Product,
  User,
} from "../models";

import {
  calculateCart,
} from "../utils/cartCalculator";

import {
  AppError,
} from "../utils/apiResponse";

class CheckoutService {

  async createReservationFromCart(
    userId: number
  ) {
    const cart =
      await cartRepository.find(
        userId
      );

    if (!cart) {
      throw new AppError(
        "No existe un carrito activo",
        404,
        "CART_NOT_FOUND"
      );
    }

    if (
      cart.checkoutReservationId
    ) {
      throw new AppError(
        "El carrito ya está en proceso de pago",
        409,
        "CHECKOUT_ALREADY_STARTED"
      );
    }

    if (
      cart.tickets.length === 0 &&
      cart.products.length === 0
    ) {
      throw new AppError(
        "El carrito está vacío",
        400,
        "EMPTY_CART"
      );
    }

    const user =
      await User.findByPk(userId, {
        include: [
          {
            model: Membership,
          },
        ],
      });

    if (!user) {
      throw new AppError(
        "Usuario no encontrado",
        404,
        "USER_NOT_FOUND"
      );
    }

    const membership =
      user.get(
        "Membership"
      ) as Membership | undefined;

    const result =
      await sequelize.transaction(
        async (transaction) => {

          /*
           * Primero validamos todos los
           * locks del carrito.
           */
          const lockIds =
            cart.tickets.map(
              (ticket) =>
                ticket.seatLockId
            );

          const locks =
            lockIds.length > 0
              ? await SeatLock.findAll({
                  where: {
                    id: {
                      [Op.in]:
                        lockIds,
                    },

                    userId,

                    status: "active",

                    expiresAt: {
                      [Op.gt]:
                        new Date(),
                    },
                  },

                  transaction,

                  lock:
                    transaction.LOCK.UPDATE,
                })
              : [];

          if (
            locks.length !==
            cart.tickets.length
          ) {
            throw new AppError(
              "Una o más sillas del carrito ya no están bloqueadas",
              409,
              "SEAT_LOCK_INVALID"
            );
          }

          /*
           * Construimos un mapa para
           * comprobar rápidamente cada lock.
           */
          const lockById =
            new Map(
              locks.map(
                (lock) => [
                  lock.id,
                  lock,
                ]
              )
            );

          /*
           * Creamos una reserva pendiente.
           */
          const reservation =
            await Reservation.create(
              {
                userId,

                total: 0,

                status: "Pendiente",
              },
              {
                transaction,
              }
            );

          /*
           * Entradas.
           */
          let ticketSubtotal = 0;

          for (
            const ticket
            of cart.tickets
          ) {

            const lock =
              lockById.get(
                ticket.seatLockId
              );

            if (!lock) {
              throw new AppError(
                "Uno de los bloqueos del carrito ya no existe",
                409,
                "SEAT_LOCK_INVALID"
              );
            }

            const showtime =
              await Showtime.findByPk(
                ticket.showtimeId,
                {
                  transaction,
                }
              );

            if (!showtime) {
              throw new AppError(
                `La función ${ticket.showtimeId} no existe`,
                404,
                "SHOWTIME_NOT_FOUND"
              );
            }

            const unitPrice =
              Number(
                showtime.basePrice
              );

            ticketSubtotal +=
              unitPrice;

            await ReservationEntry.create(
              {
                reservationId:
                  reservation.id,

                showtimeId:
                  ticket.showtimeId,

                seatId:
                  ticket.seatId,

                unitPrice,
              },
              {
                transaction,
              }
            );
          }

          /*
           * Productos.
           *
           * Tu carrito actualmente
           * puede guardar productos,
           * aunque Pacho todavía no tiene
           * habilitado el catálogo.
           */
          let productSubtotal = 0;

          for (
            const item
            of cart.products
          ) {

            const product =
              await Product.findByPk(
                item.productId,
                {
                  transaction,

                  lock:
                    transaction.LOCK.UPDATE,
                }
              );

            if (!product) {
              throw new AppError(
                `El producto ${item.productId} no existe`,
                404,
                "PRODUCT_NOT_FOUND"
              );
            }

            if (
              product.stock <
              item.quantity
            ) {
              throw new AppError(
                `Stock insuficiente para ${product.name}`,
                409,
                "INSUFFICIENT_STOCK"
              );
            }

            const subtotal =
              Number(
                product.price
              ) *
              item.quantity;

            productSubtotal +=
              subtotal;

            await ReservationProduct.create(
              {
                reservationId:
                  reservation.id,

                productId:
                  product.id,

                quantity:
                  item.quantity,

                unitPrice:
                  Number(
                    product.price
                  ),

                subtotal,
              },
              {
                transaction,
              }
            );
          }


          /*
           * Gift cards utilizadas
           * como medio de pago.
           */
          const appliedGiftCardAmount =
            cart.appliedGiftCards.reduce(
              (
                total,
                item
              ) =>
                total +
                Number(item.amount),
              0
            );

          /*
           * Descuentos de membresía.
           */
          const ticketMembershipPercent =
            cart.membershipApplied
              ? Number(
                  membership?.ticketDiscount ??
                    0
                )
              : 0;

          const productMembershipPercent =
            cart.membershipApplied
              ? Number(
                  membership?.snackDiscount ??
                    0
                )
              : 0;

          /*
           * Cálculo final.
           */
          const taxPercent =
            Number(
              process.env.CART_TAX_PERCENT ||
                19
            );

          const summary =
            calculateCart({
              ticketSubtotal,

              productSubtotal,

              giftCardPurchaseSubtotal: 0,

              ticketMembershipPercent,

              productMembershipPercent,

              promotionDiscount: 0,

              appliedGiftCardAmount,

              taxPercent,
            });

          /*
           * ESTE es el valor que cobrará
           * la pasarela.
           */
          await reservation.update(
            {
                subtotal:
                summary.subtotal,

                discount:
                summary.membershipDiscount +
                summary.promotionDiscount,

                tax:
                summary.tax,

                total:
                summary.total,
            },
            {
                transaction,
            }
        );

          return {
            reservationId:
              reservation.id,

            summary,

            expiresAt:
              locks.length > 0
                ? locks.reduce(
                    (
                      earliest,
                      lock
                    ) =>
                      lock.expiresAt <
                      earliest
                        ? lock.expiresAt
                        : earliest,
                    locks[0].expiresAt
                  )
                : null,
          };
        }
      );

    /*
     * Guardamos el ID de reserva
     * en el carrito.
     */
    cart.checkoutReservationId =
      result.reservationId;

    await cartRepository.save(
      cart
    );

    return result;
  }
}

export default new CheckoutService();