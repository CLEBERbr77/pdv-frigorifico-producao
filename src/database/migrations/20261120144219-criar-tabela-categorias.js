module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("categorias", {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      descricao: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("categorias");
  },
};
