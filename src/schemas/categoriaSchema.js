const { z } = require("zod");

const categoriaCadastroSchema = z.object({
  nome: z.string().trim().min(1, "O nome da categoria é obrigatório."),
  descricao: z.string().nullable().optional(),
});

const categoriaAtualizacaoSchema = categoriaCadastroSchema.partial();

module.exports = {
  categoriaCadastroSchema,
  categoriaAtualizacaoSchema,
};
