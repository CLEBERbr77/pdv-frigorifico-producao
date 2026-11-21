const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Venda = sequelize.define(
  "Venda",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    valor_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    forma_pagamento: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    valor_recebido: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    troco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "finalizada",
    },
  },
  {
    tableName: "vendas",
    timestamps: true,
  },
);

module.exports = Venda;
