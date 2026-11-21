const Produto = require("./Produto");
const Categoria = require("./Categoria");
const Venda = require("./Venda");
const ItemVenda = require("./ItemVenda");
const MovimentacaoEstoque = require("./MovimentacaoEstoque");

Categoria.hasMany(Produto, {
  foreignKey: "categoria_id",
  as: "produtos",
});

Produto.belongsTo(Categoria, {
  foreignKey: "categoria_id",
  as: "categoria",
});

Venda.hasMany(ItemVenda, {
  foreignKey: "venda_id",
  as: "itens",
});

ItemVenda.belongsTo(Venda, {
  foreignKey: "venda_id",
  as: "venda",
});

Produto.hasMany(ItemVenda, {
  foreignKey: "produto_id",
  as: "itensVenda",
});

ItemVenda.belongsTo(Produto, {
  foreignKey: "produto_id",
  as: "produto",
});

Produto.hasMany(MovimentacaoEstoque, {
  foreignKey: "produto_id",
  as: "movimentacoes",
});

MovimentacaoEstoque.belongsTo(Produto, {
  foreignKey: "produto_id",
  as: "produto",
});

module.exports = {
  Produto,
  Categoria,
  Venda,
  ItemVenda,
  MovimentacaoEstoque,
};
