const express = require("express");
const router = express.Router();

const VendaController = require("../controllers/vendaController");
const validarRequisicao = require("../middlewares/validarRequisicao");
const vendaSchema = require("../schemas/vendaSchema");
const idSchema = require("../schemas/idSchema");
const filtroVendaSchema = require("../schemas/filtroVendaSchema");

router.post("/", validarRequisicao(vendaSchema), VendaController.cadastrar);

router.get("/", VendaController.listar);

// Rotas específicas primeiro
router.get(
  "/relatorio",
  validarRequisicao(filtroVendaSchema, "query"),
  VendaController.relatorio,
);
router.get("/dashboard", VendaController.dashboard);

// Rota dinâmica depois
router.get(
  "/:id",
  validarRequisicao(idSchema, "params"),
  VendaController.buscarPorId,
);

router.patch(
  "/:id/cancelar",
  validarRequisicao(idSchema, "params"),
  VendaController.cancelar,
);
module.exports = router;
