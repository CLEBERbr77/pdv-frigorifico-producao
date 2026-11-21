module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vendas", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      valor_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      forma_pagamento: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "finalizada",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("vendas");
  },
};
