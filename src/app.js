const express = require("express");
const cors = require("cors");
const path = require("path");

const ProdutoRoutes = require("./routes/produtoRoutes");
const CategoriaRoutes = require("./routes/categoriaRoutes");
const VendaRoutes = require("./routes/vendaRoutes");
const MovimentacaoEstoqueRoutes = require("./routes/movimentacaoEstoqueRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibiliza os arquivos da pasta public
app.use(express.static(path.join(__dirname, "../public")));

// Rotas da API
app.use("/produtos", ProdutoRoutes);
app.use("/categorias", CategoriaRoutes);
app.use("/vendas", VendaRoutes);
app.use("/movimentacoes-estoque", MovimentacaoEstoqueRoutes);

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/index.html"));
});

module.exports = app;
