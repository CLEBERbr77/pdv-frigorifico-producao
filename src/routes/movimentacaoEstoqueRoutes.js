const express = require("express");
const router = express.Router();

const MovimentacaoEstoqueController = require("../controllers/MovimentacaoEstoqueController");
const validarRequisicao = require("../middlewares/validarRequisicao");

const movimentacaoEstoqueSchema = require("../schemas/movimentacaoEstoqueSchema");
const filtroMovimentacaoEstoqueSchema = require("../schemas/filtroMovimentacaoEstoqueSchema");
const produtoIdSchema = require("../schemas/produtoIdSchema");

router.post(
  "/entrada",
  validarRequisicao(movimentacaoEstoqueSchema),
  MovimentacaoEstoqueController.registrarEntrada,
);

router.post(
  "/saida",
  validarRequisicao(movimentacaoEstoqueSchema),
  MovimentacaoEstoqueController.registrarSaida,
);

router.get(
  "/",
  validarRequisicao(filtroMovimentacaoEstoqueSchema, "query"),
  MovimentacaoEstoqueController.listar,
);

router.get(
  "/produto/:produto_id",
  validarRequisicao(produtoIdSchema, "params"),
  MovimentacaoEstoqueController.buscarPorProduto,
);

router.get(
  "/resumo",
  validarRequisicao(filtroMovimentacaoEstoqueSchema, "query"),
  MovimentacaoEstoqueController.resumo,
);

module.exports = router;
