const { z } = require("zod");

const produtoCadastroSchema = z.object({
  nome: z.string().trim().min(1, "O nome é obrigatório."),
  codigo_produto: z
    .string()
    .trim()
    .min(1, "O código do produto é obrigatório."),
  codigo_barras: z.string().trim().nullable().optional(),
  preco: z.number().positive("O preço deve ser maior que zero."),
  unidade_medida: z
    .enum(["kg", "unidade", "peca", "pacote"], {
      error: "Selecione uma unidade de medida válida.",
    })
    .optional(),
  estoque: z.number().nonnegative().optional(),
  estoque_minimo: z.number().nonnegative().optional(),
  categoria_id: z.number().int().positive(),
});

const produtoAtualizacaoSchema = produtoCadastroSchema.partial().extend({
  ativo: z.boolean().optional(),
});

module.exports = {
  produtoCadastroSchema,
  produtoAtualizacaoSchema,
};
