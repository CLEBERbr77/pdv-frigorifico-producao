const { Produto, Categoria } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

class ProdutoController {
  // Cadastrar produto

  async cadastrar(req, res) {
    try {
      const {
        nome,
        codigo_produto,
        codigo_barras,
        preco,
        unidade_medida = "kg",
        estoque = 0,
        estoque_minimo = 0,
        categoria_id,
      } = req.body;

      // Verificar campos obrigatórios
      if (
        !nome ||
        !codigo_produto ||
        preco === undefined ||
        categoria_id === undefined
      ) {
        return res.status(400).json({
          mensagem: "Preencha os campos obrigatórios.",
        });
      }

      // Validar números
      const precoNumero = Number(preco);
      const estoqueNumero = Number(estoque);
      const estoqueMinimoNumero = Number(estoque_minimo);
      const categoriaIdNumero = Number(categoria_id);

      if (
        !Number.isFinite(precoNumero) ||
        !Number.isFinite(estoqueNumero) ||
        !Number.isFinite(estoqueMinimoNumero) ||
        !Number.isInteger(categoriaIdNumero)
      ) {
        return res.status(400).json({
          mensagem: "Informe valores numéricos válidos.",
        });
      }

      // Impedir valores negativos
      if (
        precoNumero < 0 ||
        estoqueNumero < 0 ||
        estoqueMinimoNumero < 0 ||
        categoriaIdNumero <= 0
      ) {
        return res.status(400).json({
          mensagem: "Os valores não podem ser negativos.",
        });
      }

      // Verificar categoria
      const categoria = await Categoria.findByPk(categoriaIdNumero);

      if (!categoria) {
        return res.status(404).json({
          mensagem: "Categoria não encontrada.",
        });
      }

      // Cadastrar produto
      const produto = await Produto.create({
        nome: nome.trim(),
        codigo_produto: codigo_produto.trim(),
        codigo_barras: codigo_barras || null,
        preco: precoNumero,
        unidade_medida: unidade_medida || "kg",
        estoque: estoqueNumero,
        estoque_minimo: estoqueMinimoNumero,
        categoria_id: categoriaIdNumero,
      });

      return res.status(201).json({
        mensagem: "Produto cadastrado com sucesso!",
        produto,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          mensagem: "Código do produto ou código de barras já cadastrado.",
        });
      }

      return res.status(500).json({
        mensagem: "Erro ao cadastrar produto.",
        erro: error.message,
      });
    }
  }

  // Listar todos os produtos
  async listar(req, res) {
    try {
      const produtos = await Produto.findAll({
        include: [
          {
            model: Categoria,
            as: "categoria",
          },
        ],
      });

      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao listar produtos.",
        erro: error.message,
      });
    }
  }

  // Buscar produto por ID

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          mensagem: "ID do produto inválido.",
        });
      }

      const produto = await Produto.findByPk(id, {
        include: [
          {
            model: Categoria,
            as: "categoria",
          },
        ],
      });

      if (!produto) {
        return res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
      }

      return res.status(200).json(produto);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao buscar produto.",
        erro: error.message,
      });
    }
  }

  // Atualizar produto

  async atualizar(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          mensagem: "ID do produto inválido.",
        });
      }

      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
      }

      const camposPermitidos = [
        "nome",
        "codigo_produto",
        "codigo_barras",
        "preco",
        "unidade_medida",
        "estoque",
        "estoque_minimo",
        "categoria_id",
        "ativo",
      ];

      const dadosAtualizacao = {};

      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          dadosAtualizacao[campo] = req.body[campo];
        }
      }

      if (Object.keys(dadosAtualizacao).length === 0) {
        return res.status(400).json({
          mensagem: "Informe pelo menos um campo para atualizar.",
        });
      }

      // Validar nome e código
      if ("nome" in dadosAtualizacao) {
        if (
          typeof dadosAtualizacao.nome !== "string" ||
          !dadosAtualizacao.nome.trim()
        ) {
          return res.status(400).json({
            mensagem: "Nome inválido.",
          });
        }

        dadosAtualizacao.nome = dadosAtualizacao.nome.trim();
      }

      if ("codigo_produto" in dadosAtualizacao) {
        if (
          typeof dadosAtualizacao.codigo_produto !== "string" ||
          !dadosAtualizacao.codigo_produto.trim()
        ) {
          return res.status(400).json({
            mensagem: "Código do produto inválido.",
          });
        }

        dadosAtualizacao.codigo_produto =
          dadosAtualizacao.codigo_produto.trim();
      }

      // Validar números
      for (const campo of ["preco", "estoque", "estoque_minimo"]) {
        if (campo in dadosAtualizacao) {
          const valor = Number(dadosAtualizacao[campo]);

          if (!Number.isFinite(valor) || valor < 0) {
            return res.status(400).json({
              mensagem: `${campo} deve ser um número válido e não negativo.`,
            });
          }

          dadosAtualizacao[campo] = valor;
        }
      }

      // Validar categoria
      if ("categoria_id" in dadosAtualizacao) {
        const categoriaId = Number(dadosAtualizacao.categoria_id);

        if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
          return res.status(400).json({
            mensagem: "Categoria inválida.",
          });
        }

        const categoria = await Categoria.findByPk(categoriaId);

        if (!categoria) {
          return res.status(404).json({
            mensagem: "Categoria não encontrada.",
          });
        }

        dadosAtualizacao.categoria_id = categoriaId;
      }

      // Validar status
      if (
        "ativo" in dadosAtualizacao &&
        typeof dadosAtualizacao.ativo !== "boolean"
      ) {
        return res.status(400).json({
          mensagem: "O campo ativo deve ser verdadeiro ou falso.",
        });
      }

      await produto.update(dadosAtualizacao);

      return res.status(200).json({
        mensagem: "Produto atualizado com sucesso!",
        produto,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          mensagem: "Código do produto ou código de barras já cadastrado.",
        });
      }

      return res.status(500).json({
        mensagem: "Erro ao atualizar produto.",
        erro: error.message,
      });
    }
  }

  async desativar(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          mensagem: "ID do produto inválido.",
        });
      }

      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
      }

      if (!produto.ativo) {
        return res.status(400).json({
          mensagem: "Este produto já está desativado.",
        });
      }

      await produto.update({
        ativo: false,
      });

      return res.status(200).json({
        mensagem: "Produto desativado com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao desativar produto.",
        erro: error.message,
      });
    }
  }

  async reativar(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          mensagem: "ID do produto inválido.",
        });
      }

      const produto = await Produto.findByPk(id);

      if (!produto) {
        return res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
      }

      if (produto.ativo) {
        return res.status(400).json({
          mensagem: "Este produto já está ativo.",
        });
      }

      await produto.update({
        ativo: true,
      });

      return res.status(200).json({
        mensagem: "Produto reativado com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao reativar produto.",
        erro: error.message,
      });
    }
  }

  async listarEstoqueBaixo(req, res) {
    try {
      const produtos = await Produto.findAll({
        where: {
          ativo: true,
          estoque: {
            [Op.lte]: sequelize.col("estoque_minimo"),
          },
        },
        order: [["estoque", "ASC"]],
      });

      return res.status(200).json({
        total: produtos.length,
        produtos,
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao consultar estoque baixo.",
        erro: error.message,
      });
    }
  }
}

module.exports = new ProdutoController();
