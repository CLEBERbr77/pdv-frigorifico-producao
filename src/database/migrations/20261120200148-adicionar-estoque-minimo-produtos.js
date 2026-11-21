module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("produtos", "estoque_minimo", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("produtos", "estoque_minimo");
  },
};
