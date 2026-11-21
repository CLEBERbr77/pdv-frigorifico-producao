module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("vendas", "valor_recebido", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("vendas", "troco", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("vendas", "troco");
    await queryInterface.removeColumn("vendas", "valor_recebido");
  },
};
