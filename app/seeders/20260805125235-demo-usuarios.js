'use strict';
// npx sequelize-cli seed:generate --name demo-usuarios <-- para crear nuevas semillas
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Debe coincidir exactamente con el nombre de tu tabla en la base de datos
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Juan Pérez',
        email: 'juan@correo.com',
        creado_en: new Date(),
        actualizado_en: new Date()
      },
      {
        nombre: 'María López',
        email: 'maria@correo.com',
        creado_en: new Date(),
        actualizado_en: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Esto borra los datos si decides revertir el seeder
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
