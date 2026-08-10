'use strict';
// npx sequelize-cli seed:generate --name demo-usuarios <-- para crear nuevas semillas
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Corregido: la tabla real (ver src/models/user.model.ts) es `users`
    // en inglés, con columnas `name`/`email`/`password`, no `usuarios`
    // con `nombre`/`creado_en`/`actualizado_en`.
    //
    // `password` es NOT NULL en el modelo real, así que se agrega un
    // valor de demo. NO es un hash real: cuando exista el flujo de
    // registro (HU-006) con bcrypt, estos dos usuarios de prueba deben
    // reemplazarse o su password debe re-hashearse antes de usarlos
    // para login.
    await queryInterface.bulkInsert('users', [
      {
        name: 'Juan Pérez',
        email: 'juan@correo.com',
        password: 'demo-password-not-hashed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'María López',
        email: 'maria@correo.com',
        password: 'demo-password-not-hashed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
