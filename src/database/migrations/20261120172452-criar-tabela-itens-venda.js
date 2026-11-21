module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("itens_venda", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      venda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vendas",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      produto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "produtos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      quantidade: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
      },

      preco_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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
    await queryInterface.dropTable("itens_venda");
  },
};
