const { Categoria } = require("../models");

class CategoriaController {
  // Cadastrar categoria

  async cadastrar(req, res) {
    try {
      const { nome, descricao } = req.body;

      if (typeof nome !== "string" || !nome.trim()) {
        return res.status(400).json({
          mensagem: "O nome da categoria é obrigatório.",
        });
      }

      const categoria = await Categoria.create({
        nome: nome.trim(),
        descricao: descricao || null,
      });

      return res.status(201).json({
        mensagem: "Categoria cadastrada com sucesso!",
        categoria,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          mensagem: "Já existe uma categoria com esse nome.",
        });
      }

      return res.status(500).json({
        mensagem: "Erro ao cadastrar categoria.",
        erro: error.message,
      });
    }
  }

  // Listar categorias
  async listar(req, res) {
    try {
      const categorias = await Categoria.findAll();

      return res.status(200).json(categorias);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao listar categorias.",
        erro: error.message,
      });
    }
  }

  // Buscar categoria por ID

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          mensagem: "ID da categoria inválido.",
        });
      }

      const categoria = await Categoria.findByPk(id);

      if (!categoria) {
        return res.status(404).json({
          mensagem: "Categoria não encontrada.",
        });
      }

      return res.status(200).json(categoria);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao buscar categoria.",
        erro: error.message,
      });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          mensagem: "ID da categoria inválido.",
        });
      }

      const categoria = await Categoria.findByPk(id);

      if (!categoria) {
        return res.status(404).json({
          mensagem: "Categoria não encontrada.",
        });
      }

      const dadosAtualizacao = {};

      if (req.body.nome !== undefined) {
        if (typeof req.body.nome !== "string" || !req.body.nome.trim()) {
          return res.status(400).json({
            mensagem: "Nome da categoria inválido.",
          });
        }

        dadosAtualizacao.nome = req.body.nome.trim();
      }

      if (req.body.descricao !== undefined) {
        dadosAtualizacao.descricao = req.body.descricao;
      }

      if (Object.keys(dadosAtualizacao).length === 0) {
        return res.status(400).json({
          mensagem: "Informe pelo menos um campo para atualizar.",
        });
      }

      await categoria.update(dadosAtualizacao);

      return res.status(200).json({
        mensagem: "Categoria atualizada com sucesso!",
        categoria,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          mensagem: "Já existe uma categoria com esse nome.",
        });
      }
    }
  }

  async excluir(req, res) {
    try {
      const { id } = req.params;

      if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
          mensagem: "ID da categoria inválido.",
        });
      }

      const categoria = await Categoria.findByPk(id);

      if (!categoria) {
        return res.status(404).json({
          mensagem: "Categoria não encontrada.",
        });
      }

      const produtosVinculados = await categoria.countProdutos();

      if (produtosVinculados > 0) {
        return res.status(409).json({
          mensagem:
            "Não é possível excluir uma categoria que possui produtos vinculados.",
        });
      }

      await categoria.destroy();

      return res.status(200).json({
        mensagem: "Categoria excluída com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao excluir categoria.",
        erro: error.message,
      });
    }
  }
}

module.exports = new CategoriaController();
