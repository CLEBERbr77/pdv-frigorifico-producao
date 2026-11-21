const express = require("express");
const router = express.Router();

const CategoriaController = require("../controllers/categoriaController");
const validarRequisicao = require("../middlewares/validarRequisicao");

const {
  categoriaCadastroSchema,
  categoriaAtualizacaoSchema,
} = require("../schemas/categoriaSchema");
const idSchema = require("../schemas/idSchema");

router.post(
  "/",
  validarRequisicao(categoriaCadastroSchema),
  CategoriaController.cadastrar,
);
router.get("/", CategoriaController.listar);
router.get("/:id", CategoriaController.buscarPorId);
router.put(
  "/:id",
  validarRequisicao(idSchema, "params"),
  validarRequisicao(categoriaAtualizacaoSchema),
  CategoriaController.atualizar,
);
router.delete(
  "/:id",
  validarRequisicao(idSchema, "params"),
  CategoriaController.excluir,
);

module.exports = router;
