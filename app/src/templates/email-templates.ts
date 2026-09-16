// app/src/templates/email-templates.ts

/**
 * Plantillas HTML corporativas para correos de Multicine (HU-015 Task 4)
 * ---------------------------------------------------------------------
 * Diseñadas con branding corporativo, responsive design, soporte para
 * clientes de correo estándar y pie de página con aviso de preferencias.
 */

function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function baseLayout(
  content: string,
  preheader: string = "",
  showUnsubscribe: boolean = false
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Multicine</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0f172a;
      padding: 30px 0;
    }
    .main {
      background-color: #1e293b;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid #334155;
    }
    .header {
      background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
      padding: 24px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .header p {
      margin: 4px 0 0 0;
      color: #fecdd3;
      font-size: 13px;
    }
    .content {
      padding: 32px 30px;
      color: #f8fafc;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background: #e11d48;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .card {
      background-color: #0f172a;
      border-radius: 8px;
      padding: 18px 20px;
      margin: 18px 0;
      border: 1px solid #334155;
    }
    .table-detail {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .table-detail th {
      text-align: left;
      color: #94a3b8;
      font-size: 13px;
      padding: 8px 4px;
      border-bottom: 1px solid #334155;
    }
    .table-detail td {
      padding: 10px 4px;
      border-bottom: 1px solid #1e293b;
      color: #f1f5f9;
      font-size: 14px;
    }
    .total-row td {
      font-size: 16px;
      font-weight: bold;
      color: #f43f5e;
      border-top: 2px solid #334155;
      padding-top: 12px;
    }
    .footer {
      background-color: #0b1120;
      padding: 20px 30px;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      border-top: 1px solid #1e293b;
    }
    .footer a {
      color: #f43f5e;
      text-decoration: none;
    }
    .badge {
      display: inline-block;
      background-color: #334155;
      color: #f8fafc;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>
  <table class="wrapper" role="presentation">
    <tr>
      <td align="center">
        <table class="main" role="presentation">
          <tr>
            <td class="header">
              <h1>🎬 MULTICINE</h1>
              <p>Tu experiencia cinematográfica de primera clase</p>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p>© ${new Date().getFullYear()} Multicine Colombia. Todos los derechos reservados.</p>
              ${
                showUnsubscribe
                  ? `<p>Recibes este correo porque aceptaste comunicaciones de Multicine. Puedes modificar tus preferencias de notificación en cualquier momento desde tu cuenta.</p>`
                  : `<p>Este es un correo transaccional automático generado por tus operaciones en Multicine.</p>`
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plantilla para eventos de Cuenta (activación, bienvenida, seguridad, etc.)
 */
export function renderAccountEmail(data: {
  userName?: string;
  actionTitle?: string;
  actionMessage: string;
  buttonText?: string;
  buttonUrl?: string;
  extraDetails?: Record<string, string>;
}): string {
  const name = escapeHtml(data.userName || "Usuario");
  const title = escapeHtml(data.actionTitle || "Actualización de tu cuenta");
  const message = escapeHtml(data.actionMessage);

  let buttonHtml = "";
  if (data.buttonText && data.buttonUrl) {
    buttonHtml = `
      <div style="text-align: center; margin: 25px 0;">
        <a href="${escapeHtml(data.buttonUrl)}" class="btn">${escapeHtml(data.buttonText)}</a>
      </div>
    `;
  }

  let extraHtml = "";
  if (data.extraDetails && Object.keys(data.extraDetails).length > 0) {
    extraHtml = `<div class="card">`;
    for (const [key, value] of Object.entries(data.extraDetails)) {
      extraHtml += `<p style="margin: 6px 0;"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</p>`;
    }
    extraHtml += `</div>`;
  }

  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">${title}</h2>
    <p>Hola <strong>${name}</strong>,</p>
    <p>${message}</p>
    ${extraHtml}
    ${buttonHtml}
    <p style="color: #94a3b8; font-size: 13px;">Si no realizaste esta acción, te recomendamos cambiar tu contraseña de inmediato o contactar a soporte.</p>
  `;

  return baseLayout(content, title, false);
}

/**
 * Plantilla para eventos de Compras (boletas, confitería, recibo digital)
 */
export function renderPurchaseEmail(data: {
  userName?: string;
  orderNumber: string;
  movieTitle?: string;
  cinemaName?: string;
  showtime?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  totalAmount: number;
  paymentMethod?: string;
  qrCodeUrl?: string;
}): string {
  const name = escapeHtml(data.userName || "Cliente");
  const orderNumber = escapeHtml(data.orderNumber);
  const total = Number(data.totalAmount || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
  });

  let itemsRows = "";
  if (data.items && data.items.length > 0) {
    itemsRows = data.items
      .map(
        (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td align="center">${escapeHtml(item.quantity)}</td>
          <td align="right">${Number(item.unitPrice).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
          <td align="right">${Number(item.subtotal).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
        </tr>
      `
      )
      .join("");
  }

  let movieInfoHtml = "";
  if (data.movieTitle || data.cinemaName || data.showtime) {
    movieInfoHtml = `
      <div class="card">
        <h4 style="margin: 0 0 10px 0; color: #f43f5e;">🍿 Detalles de la Función</h4>
        ${data.movieTitle ? `<p style="margin: 4px 0;"><strong>Película:</strong> ${escapeHtml(data.movieTitle)}</p>` : ""}
        ${data.cinemaName ? `<p style="margin: 4px 0;"><strong>Cine:</strong> ${escapeHtml(data.cinemaName)}</p>` : ""}
        ${data.showtime ? `<p style="margin: 4px 0;"><strong>Horario:</strong> ${escapeHtml(data.showtime)}</p>` : ""}
      </div>
    `;
  }

  let qrHtml = "";
  if (data.qrCodeUrl) {
    qrHtml = `
      <div style="text-align: center; margin: 20px 0; padding: 15px; background: #0f172a; border-radius: 8px; border: 1px dashed #e11d48;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #ffffff;">Presenta este código al ingresar a la sala:</p>
        <img src="${escapeHtml(data.qrCodeUrl)}" alt="Código QR de entrada" style="max-width: 180px; border-radius: 6px; background: white; padding: 8px;" />
      </div>
    `;
  }

  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">¡Compra Exitosa! 🎉</h2>
    <p>Hola <strong>${name}</strong>, gracias por tu compra. Aquí tienes el comprobante digital de tu transacción.</p>
    
    <div class="card" style="border-left: 4px solid #10b981;">
      <p style="margin: 4px 0;"><strong>No. de Orden:</strong> <span class="badge">${orderNumber}</span></p>
      <p style="margin: 4px 0;"><strong>Método de Pago:</strong> ${escapeHtml(data.paymentMethod || "Tarjeta / Digital")}</p>
      <p style="margin: 4px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CO")}</p>
    </div>

    ${movieInfoHtml}

    <h3 style="color: #ffffff; margin-top: 25px;">Resumen del Pedido</h3>
    <table class="table-detail">
      <thead>
        <tr>
          <th>Concepto</th>
          <th style="text-align:center;">Cant.</th>
          <th style="text-align:right;">Precio</th>
          <th style="text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
        <tr class="total-row">
          <td colspan="3">TOTAL PAGADO</td>
          <td align="right">${total}</td>
        </tr>
      </tbody>
    </table>

    ${qrHtml}

    <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
      Recuerda llegar al menos 15 minutos antes de la función. ¡Disfruta la película!
    </p>
  `;

  return baseLayout(
    content,
    `Comprobante de compra #${orderNumber} - Multicine`,
    false
  );
}

/**
 * Plantilla para eventos de Reservas
 */
export function renderReservationEmail(data: {
  userName?: string;
  reservationCode: string;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  showtime: string;
  seats: string[] | string;
  qrCodeUrl?: string;
  expiresAt?: string;
}): string {
  const name = escapeHtml(data.userName || "Cliente");
  const seatsFormatted = Array.isArray(data.seats)
    ? data.seats.join(", ")
    : String(data.seats);

  let qrHtml = "";
  if (data.qrCodeUrl) {
    qrHtml = `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${escapeHtml(data.qrCodeUrl)}" alt="QR Reserva" style="max-width: 160px; background: white; padding: 8px; border-radius: 6px;" />
      </div>
    `;
  }

  let expiryWarning = "";
  if (data.expiresAt) {
    expiryWarning = `
      <div class="card" style="border-left: 4px solid #f59e0b; background-color: #1e1b4b;">
        <p style="margin: 0; color: #fde047; font-size: 13px;">
          ⏳ <strong>Atención:</strong> Esta reserva expira el <strong>${escapeHtml(data.expiresAt)}</strong> si no se completa el pago.
        </p>
      </div>
    `;
  }

  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">Confirmación de Reserva 🎟️</h2>
    <p>Hola <strong>${name}</strong>, tu reserva ha sido procesada exitosamente.</p>

    <div class="card">
      <p style="margin: 4px 0;"><strong>Código de Reserva:</strong> <span class="badge">${escapeHtml(data.reservationCode)}</span></p>
      <p style="margin: 4px 0;"><strong>Película:</strong> ${escapeHtml(data.movieTitle)}</p>
      <p style="margin: 4px 0;"><strong>Complejo:</strong> ${escapeHtml(data.cinemaName)}</p>
      <p style="margin: 4px 0;"><strong>Sala:</strong> ${escapeHtml(data.roomName)}</p>
      <p style="margin: 4px 0;"><strong>Función:</strong> ${escapeHtml(data.showtime)}</p>
      <p style="margin: 4px 0;"><strong>Sillas seleccionadas:</strong> <span style="color: #f43f5e; font-weight: bold;">${escapeHtml(seatsFormatted)}</span></p>
    </div>

    ${expiryWarning}
    ${qrHtml}
  `;

  return baseLayout(
    content,
    `Reserva confirmada ${data.reservationCode} - Multicine`,
    false
  );
}

/**
 * Plantilla para eventos de Marketing y Promociones
 */
export function renderMarketingEmail(data: {
  userName?: string;
  campaignTitle: string;
  campaignBody: string;
  movies?: Array<{
    title: string;
    releaseDate?: string;
    bannerUrl?: string;
    description?: string;
  }>;
  promoCode?: string;
  discountText?: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const name = escapeHtml(data.userName || "Cinéfilo");
  const title = escapeHtml(data.campaignTitle);
  const body = escapeHtml(data.campaignBody);

  let moviesHtml = "";
  if (data.movies && data.movies.length > 0) {
    moviesHtml = data.movies
      .map(
        (m) => `
        <div class="card" style="margin-bottom: 15px;">
          ${m.bannerUrl ? `<img src="${escapeHtml(m.bannerUrl)}" alt="${escapeHtml(m.title)}" style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;" />` : ""}
          <h4 style="margin: 0 0 6px 0; color: #ffffff; font-size: 16px;">${escapeHtml(m.title)}</h4>
          ${m.releaseDate ? `<p style="margin: 2px 0; color: #f43f5e; font-size: 13px;">📅 Estreno: ${escapeHtml(m.releaseDate)}</p>` : ""}
          ${m.description ? `<p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">${escapeHtml(m.description)}</p>` : ""}
        </div>
      `
      )
      .join("");
  }

  let promoBanner = "";
  if (data.promoCode || data.discountText) {
    promoBanner = `
      <div class="card" style="background: linear-gradient(135deg, #831843 0%, #500724 100%); text-align: center; border: 1px solid #be123c;">
        ${data.discountText ? `<h3 style="margin: 0 0 8px 0; color: #fecdd3;">${escapeHtml(data.discountText)}</h3>` : ""}
        ${data.promoCode ? `<p style="margin: 0; font-size: 14px;">Usa el cupón: <span style="background: #ffffff; color: #be123c; padding: 4px 10px; border-radius: 4px; font-weight: 800; font-size: 16px; letter-spacing: 1px;">${escapeHtml(data.promoCode)}</span></p>` : ""}
      </div>
    `;
  }

  let ctaHtml = "";
  if (data.ctaText && data.ctaUrl) {
    ctaHtml = `
      <div style="text-align: center; margin: 25px 0;">
        <a href="${escapeHtml(data.ctaUrl)}" class="btn">${escapeHtml(data.ctaText)}</a>
      </div>
    `;
  }

  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">${title}</h2>
    <p>Hola <strong>${name}</strong>,</p>
    <p>${body}</p>

    ${promoBanner}
    ${moviesHtml}
    ${ctaHtml}
  `;

  return baseLayout(content, title, true);
}
