const { z } = require("zod");

const idSchema = z.object({
  id: z.coerce
    .number()
    .int("O ID deve ser um número inteiro.")
    .positive("O ID deve ser positivo."),
});

module.exports = idSchema;
