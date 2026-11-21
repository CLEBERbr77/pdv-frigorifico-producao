const { z } = require("zod");

const movimentacaoEstoqueSchema = z.object({
  produto_id: z
    .number()
    .int()
    .positive("O ID do produto deve ser um inteiro positivo."),

  quantidade: z.number().positive("A quantidade deve ser maior que zero."),

  motivo: z.string().trim().nullable().optional(),
});

module.exports = movimentacaoEstoqueSchema;
