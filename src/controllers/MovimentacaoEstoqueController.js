const { MovimentacaoEstoque, Produto } = require("../models");
const sequelize = require("../config/database");
const { Op } = require("sequelize");

class MovimentacaoEstoqueController {
  async registrarEntrada(req, res) {
    let transacao;

    try {
      transacao = await sequelize.transaction();

      const { produto_id, quantidade, motivo } = req.body;

      if (!produto_id || !quantidade || Number(quantidade) <= 0) {
        await transacao.rollback();

        return res.status(400).json({
          mensagem: "Informe um produto e uma quantidade válida.",
        });
      }

      const produto = await Produto.findByPk(produto_id, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
      });

      if (!produto) {
        await transacao.rollback();

        return res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
      }

      if (!produto.ativo) {
        await transacao.rollback();

        return res.status(400).json({
          mensagem: "Não é possível movimentar um produto desativado.",
        });
      }

      await produto.update(
        {
          estoque: Number(produto.estoque) + Number(quantidade),
        },
        { transaction: transacao },
      );

      const movimentacao = await MovimentacaoEstoque.create(
        {
          produto_id,
          tipo: "entrada",
          quantidade,
          motivo,
        },
        { transaction: transacao },
      );

      await transacao.commit();

      return res.status(201).json({
        mensagem: "Entrada registrada com sucesso!",
        produto,
        movimentacao,
      });
    } catch (error) {
      if (transacao && !transacao.finished) {
        await transacao.rollback();
      }

      return res.status(500).json({
        mensagem: "Erro ao registrar entrada.",
        erro: error.message,
      });
    }
  }

  async registrarSaida(req, res) {
    let transacao;

    try {
      transacao = await sequelize.transaction();

      const { produto_id, quantidade, motivo } = req.body;

      if (!produto_id || !quantidade || Number(quantidade) <= 0) {
        await transacao.rollback();

        return res.status(400).json({
          mensagem: "Informe um produto e uma quantidade válida.",
        });
      }

      const produto = await Produto.findByPk(produto_id, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
      });

      if (!produto) {
        await transacao.rollback();

        return res.status(404).json({
          mensagem: "Produto não encontrado.",
        });
      }

      if (!produto.ativo) {
        await transacao.rollback();

        return res.status(400).json({
          mensagem: "Não é possível movimentar um produto desativado.",
        });
      }

      if (Number(produto.estoque) < Number(quantidade)) {
        await transacao.rollback();

        return res.status(400).json({
          mensagem: "Estoque insuficiente.",
        });
      }

      await produto.update(
        {
          estoque: Number(produto.estoque) - Number(quantidade),
        },
        { transaction: transacao },
      );

      const movimentacao = await MovimentacaoEstoque.create(
        {
          produto_id,
          tipo: "saida",
          quantidade,
          motivo,
        },
        { transaction: transacao },
      );

      await transacao.commit();

      return res.status(201).json({
        mensagem: "Saída registrada com sucesso!",
        produto,
        movimentacao,
      });
    } catch (error) {
      if (transacao && !transacao.finished) {
        await transacao.rollback();
      }

      return res.status(500).json({
        mensagem: "Erro ao registrar saída.",
        erro: error.message,
      });
    }
  }

  async listar(req, res) {
    try {
      const { tipo, data_inicio, data_fim, produto_id } =
        req.dadosValidados.query;

      const filtros = {};

      if (tipo) {
        filtros.tipo = tipo;
      }

      if (produto_id) {
        filtros.produto_id = produto_id;
      }

      if (data_inicio || data_fim) {
        filtros.createdAt = {};

        if (data_inicio) {
          filtros.createdAt[Op.gte] = new Date(`${data_inicio}T00:00:00`);
        }

        if (data_fim) {
          filtros.createdAt[Op.lt] = new Date(
            new Date(`${data_fim}T00:00:00`).getTime() + 86400000,
          );
        }
      }

      const movimentacoes = await MovimentacaoEstoque.findAll({
        where: filtros,
        include: [
          {
            model: Produto,
            as: "produto",
            attributes: ["id", "nome", "codigo_produto", "unidade_medida"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(movimentacoes);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao listar movimentações.",
        erro: error.message,
      });
    }
  }

  async buscarPorProduto(req, res) {
    try {
      const { produto_id } = req.dadosValidados.params;

      const movimentacoes = await MovimentacaoEstoque.findAll({
        where: { produto_id },
        include: [
          {
            model: Produto,
            as: "produto",
            attributes: ["id", "nome", "codigo_produto"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(movimentacoes);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao buscar movimentações do produto.",
        erro: error.message,
      });
    }
  }

  async resumo(req, res) {
    try {
      const { data_inicio, data_fim, produto_id } = req.dadosValidados.query;

      const filtros = {};

      if (produto_id) {
        filtros.produto_id = produto_id;
      }

      if (data_inicio || data_fim) {
        filtros.createdAt = {};

        if (data_inicio) {
          filtros.createdAt[Op.gte] = new Date(`${data_inicio}T00:00:00`);
        }

        if (data_fim) {
          filtros.createdAt[Op.lt] = new Date(
            new Date(`${data_fim}T00:00:00`).getTime() + 86400000,
          );
        }
      }

      const entradas = await MovimentacaoEstoque.sum("quantidade", {
        where: { ...filtros, tipo: "entrada" },
      });

      const saidas = await MovimentacaoEstoque.sum("quantidade", {
        where: { ...filtros, tipo: "saida" },
      });

      const quantidade_entradas = await MovimentacaoEstoque.count({
        where: { ...filtros, tipo: "entrada" },
      });

      const quantidade_saidas = await MovimentacaoEstoque.count({
        where: { ...filtros, tipo: "saida" },
      });

      return res.status(200).json({
        produto_id: produto_id || "todos",
        periodo: {
          data_inicio: data_inicio || null,
          data_fim: data_fim || null,
        },
        quantidade_entradas,
        quantidade_saidas,
        total_entradas: entradas || 0,
        total_saidas: saidas || 0,
        saldo_movimentado: Number(entradas || 0) - Number(saidas || 0),
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao gerar resumo de movimentações.",
        erro: error.message,
      });
    }
  }
}

module.exports = new MovimentacaoEstoqueController();
