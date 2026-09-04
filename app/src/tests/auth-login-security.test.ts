// app/src/tests/auth-login-security.test.ts

/**
 * Pruebas QA HU-007: Inicio de Sesión y Autenticación Segura
 * ----------------------------------------------------------
 * - Escenario 1: login exitoso emite tokens e invalida el refresh token anterior.
 * - Escenario 2: 5 intentos fallidos consecutivos bloquean la cuenta por 15 minutos.
 * - Escenario 3: cuenta con correo sin verificar es rechazada con mensaje específico.
 * - Escenario 4: renovación de sesión mediante refresh token válido.
 * - Logout revoca el refresh token.
 *
 * Requiere la base de datos de desarrollo con el seed aplicado
 * (usuario demo `juan@correo.com` / `password123`).
 */

import "dotenv/config";

import sequelize from "../config/database";
import "../models";

import userService from "../services/user.service";
import UserRepository from "../repositories/user.repository";
import { AppError } from "../utils/apiResponse";

const DEMO_EMAIL = "juan@correo.com";
const DEMO_PASSWORD = "password123";

async function expectAppError(promise: Promise<unknown>, code: string, status: number) {
  try {
    await promise;
    throw new Error(`Se esperaba AppError con código ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    const appError = error as AppError;
    expect(appError.code).toBe(code);
    expect(appError.status).toBe(status);
  }
}

describe("HU-007 - Login seguro y gestión de sesión", () => {
  let userId: number;
  let currentRefreshToken: string;
  /** Refresh token revocado (guardado al rotar) para pruebas de rechazo. */
  let revokedRefreshToken: string;

  beforeAll(async () => {
    await sequelize.authenticate();

    const user = await UserRepository.findByEmail(DEMO_EMAIL);
    if (!user) {
      throw new Error(
        "No existe el usuario demo. Ejecuta primero el seed (npm run seed)."
      );
    }
    userId = user.id;
  });

  afterEach(async () => {
    // Deja la cuenta operativa para la siguiente prueba.
    await User_sequelize_update({ failedLoginAttempts: 0, lockedUntil: null });
  });

  /** Helper local para actualizar sin importar el modelo dos veces. */
  async function User_sequelize_update(data: Record<string, unknown>) {
    await sequelize.models.User.update(data, { where: { id: userId } });
  }

  afterAll(async () => {
    await User_sequelize_update({ failedLoginAttempts: 0, lockedUntil: null });
    if (currentRefreshToken) {
      await UserRepository.revokeRefreshToken(currentRefreshToken);
    }
    await sequelize.close();
  });

  it(
    "Escenario 2: bloquea la cuenta tras 5 intentos fallidos consecutivos",
    async () => {
      for (let attempt = 1; attempt <= 4; attempt++) {
        await expectAppError(
          userService.login(DEMO_EMAIL, "contrasena-incorrecta"),
          "INVALID_CREDENTIALS",
          401
        );
      }

      const userBeforeLock = await UserRepository.findById(userId);
      expect(userBeforeLock!.failedLoginAttempts).toBe(4);

      // Quinto intento fallido dispara el bloqueo temporal.
      await expectAppError(
        userService.login(DEMO_EMAIL, "contrasena-incorrecta"),
        "ACCOUNT_LOCKED",
        423
      );

      const lockedUser = await UserRepository.findById(userId);
      expect(lockedUser!.lockedUntil).not.toBeNull();
      expect(lockedUser!.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
    },
    15000
  );

  it(
    "Escenario 2: rechaza credenciales correctas mientras la cuenta está bloqueada",
    async () => {
      // La prueba anterior dejó la cuenta bloqueada; re-aplicamos el estado
      // porque afterEach la restaura.
      await sequelize.models.User.update(
        { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
        { where: { id: userId } }
      );

      await expectAppError(
        userService.login(DEMO_EMAIL, DEMO_PASSWORD),
        "ACCOUNT_LOCKED",
        423
      );
    },
    15000
  );

  it(
    "Escenario 2: permite iniciar sesión cuando la ventana de bloqueo expira",
    async () => {
      await sequelize.models.User.update(
        { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() - 1000) },
        { where: { id: userId } }
      );

      const result = await userService.login(DEMO_EMAIL, DEMO_PASSWORD);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.user.email).toBe(DEMO_EMAIL);

      currentRefreshToken = result.refreshToken;

      const user = await UserRepository.findById(userId);
      expect(user!.failedLoginAttempts).toBe(0);
      expect(user!.lockedUntil).toBeNull();
    },
    15000
  );

  it(
    "Escenario 3: rechaza cuentas con correo sin verificar indicándolo explícitamente",
    async () => {
      await sequelize.models.User.update(
        { emailVerified: false, accountStatus: "inactiva" },
        { where: { id: userId } }
      );

      await expectAppError(
        userService.login(DEMO_EMAIL, DEMO_PASSWORD),
        "EMAIL_NOT_VERIFIED",
        403
      );

      await sequelize.models.User.update(
        { emailVerified: true, accountStatus: "activa" },
        { where: { id: userId } }
      );
    },
    15000
  );

  it(
    "Escenario 1: un login exitoso invalida el refresh token anterior",
    async () => {
      const first = await userService.login(DEMO_EMAIL, DEMO_PASSWORD);
      const firstToken = first.refreshToken;

      const second = await userService.login(DEMO_EMAIL, DEMO_PASSWORD);

      // El token de la primera sesión ya no es válido.
      const revokedOld = await UserRepository.findValidRefreshToken(firstToken);
      expect(revokedOld).toBeNull();

      // El token nuevo sí lo es.
      const validNew = await UserRepository.findValidRefreshToken(second.refreshToken);
      expect(validNew).not.toBeNull();
      expect(validNew!.userId).toBe(userId);

      currentRefreshToken = second.refreshToken;
    },
    15000
  );

  it(
    "Escenario 4: renueva el access token con refresh token válido y rota el par",
    async () => {
      const refreshed = await userService.refresh(currentRefreshToken);

      expect(refreshed.accessToken).toBeTruthy();
      expect(refreshed.refreshToken).toBeTruthy();
      expect(refreshed.refreshToken).not.toBe(currentRefreshToken);
      expect(refreshed.user.id).toBe(userId);

      // El token usado quedó revocado (rotación): se conserva para la
      // siguiente prueba, que debe rechazarlo.
      revokedRefreshToken = currentRefreshToken;
      currentRefreshToken = refreshed.refreshToken;

      const validNew = await UserRepository.findValidRefreshToken(currentRefreshToken);
      expect(validNew).not.toBeNull();
    },
    15000
  );

  it(
    "Escenario 4: rechaza un refresh token ya revocado (rotado)",
    async () => {
      await expectAppError(
        userService.refresh(revokedRefreshToken),
        "INVALID_REFRESH_TOKEN",
        401
      );
    },
    15000
  );

  it("logout revoca el refresh token activo", async () => {
    const session = await userService.login(DEMO_EMAIL, DEMO_PASSWORD);
    expect(session.refreshToken).toBeTruthy();

    await userService.logout(session.refreshToken, "127.0.0.1", "jest");

    const revoked = await UserRepository.findValidRefreshToken(session.refreshToken);
    expect(revoked).toBeNull();

    currentRefreshToken = "";
  }, 15000);
});
