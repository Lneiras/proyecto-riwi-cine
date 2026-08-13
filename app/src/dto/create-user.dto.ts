// app/src/dto/create-user.dto.ts

/**
 * DTO - Creación de Usuario
 * -------------------------
 * Este DTO representa la información necesaria para crear un nuevo usuario.
 *
 * Un DTO (Data Transfer Object) define el contrato de datos entre el cliente
 * y la API, evitando exponer directamente el modelo de base de datos.
 *
 * @example
 * const dto: CreateUserDto = {
 *   name: "David Mtz",
 *   email: "david@example.com",
 *   password: "password123"
 * };
 */

export interface CreateUserDto {
  /**
   * Nombre completo del usuario.
   */
  name: string;

  /**
   * Correo electrónico del usuario.
   */
  email: string;

  /**
   * Contraseña en texto plano (se hashea en el service antes de persistir).
   */
  password: string;

  /**
   * FK hacia roles (opcional; por defecto se asigna el rol "Cliente").
   */
  roleId?: number;

  /**
   * FK hacia memberships (opcional; por defecto 1).
   */
  membershipId?: number;

  /**
   * FK hacia cities (opcional).
   */
  cityId?: number | null;

  /**
   * FK hacia userGenres (opcional).
   */
  userGenreId?: number | null;
}
