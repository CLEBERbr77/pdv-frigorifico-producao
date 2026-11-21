module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("produtos", "unidade_medida", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "kg",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("produtos", "unidade_medida");
  },
};
