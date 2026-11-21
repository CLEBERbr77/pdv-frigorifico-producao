const { z } = require("zod");

const filtroMovimentacaoEstoqueSchema = z
  .object({
    tipo: z.enum(["entrada", "saida"]).optional(),

    produto_id: z.coerce.number().int().positive().optional(),

    data_inicio: z.iso.date().optional(),

    data_fim: z.iso.date().optional(),
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

module.exports = filtroMovimentacaoEstoqueSchema;
