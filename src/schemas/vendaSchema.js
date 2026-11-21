const { z } = require("zod");

const vendaSchema = z
  .object({
    forma_pagamento: z.enum([
      "dinheiro",
      "pix",
      "cartao_credito",
      "cartao_debito",
    ]),

    valor_recebido: z.number().nonnegative().optional(),

    itens: z
      .array(
        z.object({
          produto_id: z.number().int().positive(),
          quantidade: z.number().positive(),
        }),
      )
      .min(1, "A venda precisa ter pelo menos um produto."),
  })
  .superRefine((dados, contexto) => {
    if (
      dados.forma_pagamento === "dinheiro" &&
      dados.valor_recebido === undefined
    ) {
      contexto.addIssue({
        code: "custom",
        path: ["valor_recebido"],
        message: "Informe o valor recebido em dinheiro.",
      });
    }
  });

module.exports = vendaSchema;
