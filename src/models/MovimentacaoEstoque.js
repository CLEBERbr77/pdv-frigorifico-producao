const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MovimentacaoEstoque = sequelize.define(
  "MovimentacaoEstoque",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    produto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "movimentacoes_estoque",
    timestamps: true,
  },
);

module.exports = MovimentacaoEstoque;
