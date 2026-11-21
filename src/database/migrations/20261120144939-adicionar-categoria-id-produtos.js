module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("produtos", "categoria_id", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("produtos", "categoria_id");
  },
};
