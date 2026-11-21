const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Produto = sequelize.define(
  "Produto",
  {
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categorias",
        key: "id",
      },
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    codigo_produto: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    codigo_barras: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    unidade_medida: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "kg",
      validate: {
        isIn: [["kg", "unidade", "peca", "pacote"]],
      },
    },

    estoque: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    },

    estoque_minimo: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0,
    },

    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "produtos",
    timestamps: true,
  },
);

module.exports = Produto;
