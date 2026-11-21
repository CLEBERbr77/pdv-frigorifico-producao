const { z } = require("zod");

const filtroVendaSchema = z
  .object({
    data_inicio: z.iso.date().optional(),

    data_fim: z.iso.date().optional(),

    forma_pagamento: z
      .enum(["dinheiro", "pix", "cartao_credito", "cartao_debito"])
      .optional(),
  })
  .refine(
    (dados) => {
      if (dados.data_inicio && dados.data_fim) {
        return dados.data_inicio <= dados.data_fim;
      }

      return true;
    },
    {
      message: "A data inicial não pode ser posterior à data final.",
      path: ["data_inicio"],
    },
  );

module.exports = filtroVendaSchema;
