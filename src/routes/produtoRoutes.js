const express = require("express");
const router = express.Router();

const ProdutoController = require("../controllers/produtoController");
const validarRequisicao = require("../middlewares/validarRequisicao");

const idSchema = require("../schemas/idSchema");

const {
  produtoCadastroSchema,
  produtoAtualizacaoSchema,
} = require("../schemas/produtoSchema");

router.post(
  "/",
  validarRequisicao(produtoCadastroSchema),
  ProdutoController.cadastrar,
);

router.get("/", ProdutoController.listar);

router.get("/estoque-baixo", ProdutoController.listarEstoqueBaixo);

router.get(
  "/:id",
  validarRequisicao(idSchema, "params"),
  ProdutoController.buscarPorId,
);

router.put(
  "/:id",
  validarRequisicao(idSchema, "params"),
  validarRequisicao(produtoAtualizacaoSchema),
  ProdutoController.atualizar,
);

router.patch(
  "/:id",
  validarRequisicao(idSchema, "params"),
  ProdutoController.desativar,
);

router.patch(
  "/:id/reativar",
  validarRequisicao(idSchema, "params"),
  ProdutoController.reativar,
);

module.exports = router;
