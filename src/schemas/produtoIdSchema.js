const { z } = require("zod");

const produtoIdSchema = z.object({
  produto_id: z.coerce
    .number()
    .int("O ID do produto deve ser um número inteiro.")
    .positive("O ID do produto deve ser positivo."),
});

module.exports = produtoIdSchema;
