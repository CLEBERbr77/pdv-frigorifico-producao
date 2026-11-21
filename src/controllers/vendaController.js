const { Venda, ItemVenda, Produto, MovimentacaoEstoque } = require("../models");
const sequelize = require("../config/database");
const { fn, col, Op } = require("sequelize");

class VendaController {
  // Cadastrar venda
  async cadastrar(req, res) {
    let transacao;

    try {
      transacao = await sequelize.transaction();

      const { forma_pagamento, valor_recebido, itens } = req.body;

      let valor_total_centavos = 0;
      const itensVenda = [];

      // Percorrer os produtos recebidos
      for (const item of itens) {
        const produto = await Produto.findByPk(item.produto_id, {
          transaction: transacao,
          lock: transacao.LOCK.UPDATE,
        });

        if (!produto || !produto.ativo) {
          throw new Error(
            `Produto ${item.produto_id} não encontrado ou inativo.`,
          );
        }

        const quantidade = Number(item.quantidade);
        const preco_unitario = Number(produto.preco);
        const estoque = Number(produto.estoque);

        if (!Number.isFinite(quantidade) || quantidade <= 0) {
          throw new Error("Quantidade inválida.");
        }

        if (quantidade > estoque) {
          throw new Error(
            `Estoque insuficiente para o produto ${produto.nome}.`,
          );
        }

        const subtotal = Number((quantidade * preco_unitario).toFixed(2));

        valor_total_centavos += Math.round(subtotal * 100);

        itensVenda.push({
          produto_id: produto.id,
          quantidade,
          preco_unitario,
          subtotal,
        });

        // Atualizar estoque
        await produto.update(
          {
            estoque: estoque - quantidade,
          },
          {
            transaction: transacao,
          },
        );
      }

      const valor_total = valor_total_centavos / 100;

      // Calcular valor recebido e troco
      let recebido_centavos = 0;
      let troco_centavos = 0;

      if (forma_pagamento === "dinheiro") {
        recebido_centavos = Math.round(Number(valor_recebido) * 100);

        if (
          !Number.isFinite(recebido_centavos) ||
          recebido_centavos < valor_total_centavos
        ) {
          throw new Error(
            "O valor recebido não pode ser menor que o total da venda.",
          );
        }

        troco_centavos = recebido_centavos - valor_total_centavos;
      }

      // Criar a venda
      const venda = await Venda.create(
        {
          valor_total,
          forma_pagamento,
          valor_recebido: recebido_centavos / 100,
          troco: troco_centavos / 100,
        },
        {
          transaction: transacao,
        },
      );

      // Criar os itens da venda
      const itensCriados = itensVenda.map((item) => ({
        ...item,
        venda_id: venda.id,
      }));

      await ItemVenda.bulkCreate(itensCriados, {
        transaction: transacao,
      });

      // Registrar as saídas no histórico do estoque
      for (const item of itensCriados) {
        await MovimentacaoEstoque.create(
          {
            produto_id: item.produto_id,
            tipo: "saida",
            quantidade: item.quantidade,
            motivo: `Venda #${venda.id}`,
          },
          {
            transaction: transacao,
          },
        );
      }

      // Buscar a venda completa com seus produtos
      const vendaCompleta = await Venda.findByPk(venda.id, {
        include: [
          {
            model: ItemVenda,
            as: "itens",
            include: [
              {
                model: Produto,
                as: "produto",
                attributes: ["id", "nome", "unidade_medida"],
              },
            ],
          },
        ],
        transaction: transacao,
      });

      // Confirmar a transação
      await transacao.commit();

      return res.status(201).json({
        mensagem: "Venda realizada com sucesso!",
        venda: vendaCompleta,
      });
    } catch (error) {
      if (transacao && !transacao.finished) {
        await transacao.rollback();
      }
      return res.status(500).json({
        mensagem: "Erro ao realizar venda.",
        erro: error.message,
      });
    }
  }

  // Listar todas as vendas
  async listar(req, res) {
    try {
      const vendas = await Venda.findAll({
        include: [
          {
            model: ItemVenda,
            as: "itens",
            include: [
              {
                model: Produto,
                as: "produto",
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(vendas);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao listar vendas.",
        erro: error.message,
      });
    }
  }
  // Buscar venda por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;

      const venda = await Venda.findByPk(id, {
        include: [
          {
            model: ItemVenda,
            as: "itens",
            include: [
              {
                model: Produto,
                as: "produto",
              },
            ],
          },
        ],
      });

      if (!venda) {
        return res.status(404).json({
          mensagem: "Venda não encontrada.",
        });
      }

      return res.status(200).json(venda);
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao buscar venda.",
        erro: error.message,
      });
    }
  }

  // Cancelar venda
  async cancelar(req, res) {
    let transacao;

    try {
      transacao = await sequelize.transaction();
      const { id } = req.params;
      const venda = await Venda.findByPk(id, {
        transaction: transacao,
        lock: transacao.LOCK.UPDATE,
      });

      if (!venda) {
        await transacao.rollback();

        return res.status(404).json({
          mensagem: "Venda não encontrada.",
        });
      }

      if (venda.status === "cancelada") {
        await transacao.rollback();

        return res.status(400).json({
          mensagem: "Esta venda já foi cancelada.",
        });
      }
      const itens = await ItemVenda.findAll({
        where: {
          venda_id: venda.id,
        },
        transaction: transacao,
      });

      for (const item of itens) {
        const produto = await Produto.findByPk(item.produto_id, {
          transaction: transacao,
          lock: transacao.LOCK.UPDATE,
        });

        if (!produto) {
          throw new Error(`Produto ${item.produto_id} não encontrado.`);
        }

        await produto.update(
          {
            estoque: Number(produto.estoque) + Number(item.quantidade),
          },
          {
            transaction: transacao,
          },
        );

        // Registrar a entrada no histórico do estoque
        await MovimentacaoEstoque.create(
          {
            produto_id: produto.id,
            tipo: "entrada",
            quantidade: Number(item.quantidade),
            motivo: `Cancelamento da venda #${venda.id}`,
          },
          {
            transaction: transacao,
          },
        );
      }

      await venda.update(
        {
          status: "cancelada",
        },
        {
          transaction: transacao,
        },
      );

      await transacao.commit();

      return res.status(200).json({
        mensagem: "Venda cancelada e estoque atualizado com sucesso!",
        venda,
      });
    } catch (error) {
      if (transacao && !transacao.finished) {
        await transacao.rollback();
      }

      return res.status(500).json({
        mensagem: "Erro ao cancelar venda.",
        erro: error.message,
      });
    }
  }

  async relatorio(req, res) {
    try {
      const { data_inicio, data_fim, forma_pagamento } =
        req.dadosValidados.query;

      const filtros = {
        status: "finalizada",
      };

      // Filtrar por forma de pagamento, se especificada
      if (forma_pagamento) {
        filtros.forma_pagamento = forma_pagamento;
      }

      // Validar as datas
      if (data_inicio && isNaN(Date.parse(data_inicio))) {
        return res.status(400).json({
          mensagem: "Data inicial inválida.",
        });
      }

      if (data_fim && isNaN(Date.parse(data_fim))) {
        return res.status(400).json({
          mensagem: "Data final inválida.",
        });
      }

      // Montar filtro de período
      if (data_inicio || data_fim) {
        filtros.createdAt = {};

        if (data_inicio) {
          filtros.createdAt[Op.gte] = new Date(`${data_inicio}T00:00:00.000Z`);
        }

        if (data_fim) {
          filtros.createdAt[Op.lte] = new Date(`${data_fim}T23:59:59.999Z`);
        }
      }

      // Total de vendas finalizadas no período
      const vendas_finalizadas = await Venda.count({
        where: filtros,
      });

      // Total de vendas canceladas no período
      const vendas_canceladas = await Venda.count({
        where: {
          ...filtros,
          status: "cancelada",
        },
      });

      // Total geral de vendas no período
      const total_vendas = vendas_finalizadas + vendas_canceladas;

      // Faturamento
      const faturamento_total = await Venda.sum("valor_total", {
        where: filtros,
      });

      // Faturamento por forma de pagamento
      const faturamento_por_pagamento = await Venda.findAll({
        attributes: [
          "forma_pagamento",
          [fn("SUM", col("valor_total")), "total"],
        ],
        where: filtros,
        group: ["forma_pagamento"],
        raw: true,
      });

      return res.status(200).json({
        periodo: {
          data_inicio: data_inicio || null,
          data_fim: data_fim || null,
        },
        total_vendas,
        vendas_canceladas,
        vendas_finalizadas,
        faturamento_total: faturamento_total || 0,
        faturamento_por_pagamento,
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao gerar relatório de vendas.",
        erro: error.message,
      });
    }
  }

  async dashboard(req, res) {
    try {
      // Descobrir a data atual de Fortaleza
      const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Fortaleza",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());

      const ano = partes.find((p) => p.type === "year").value;
      const mes = partes.find((p) => p.type === "month").value;
      const dia = partes.find((p) => p.type === "day").value;

      const hoje = `${ano}-${mes}-${dia}`;

      // Calcular o início do dia seguinte
      const proximoDia = new Date(
        Date.UTC(Number(ano), Number(mes) - 1, Number(dia) + 1),
      )
        .toISOString()
        .slice(0, 10);

      // Definir o intervalo do dia em Fortaleza (UTC-3)
      const inicio = new Date(`${hoje}T00:00:00-03:00`);
      const fim = new Date(`${proximoDia}T00:00:00-03:00`);

      // Buscar somente vendas finalizadas
      const filtros = {
        status: "finalizada",
        createdAt: {
          [Op.gte]: inicio,
          [Op.lt]: fim,
        },
      };

      // Quantidade de vendas do dia
      const quantidade_vendas = await Venda.count({
        where: filtros,
      });

      // Faturamento do dia
      const faturamento_total = await Venda.sum("valor_total", {
        where: filtros,
      });
      // Calcular ticket médio
      const ticket_medio =
        quantidade_vendas > 0
          ? Number(
              (Number(faturamento_total || 0) / quantidade_vendas).toFixed(2),
            )
          : 0;
      // Buscar produto mais vendido do dia
      const produto_mais_vendido = await ItemVenda.findOne({
        attributes: [
          "produto_id",
          [fn("SUM", col("quantidade")), "quantidade_vendida"],
        ],
        include: [
          {
            model: Venda,
            as: "venda",
            attributes: [],
            where: filtros,
            required: true,
          },
          {
            model: Produto,
            as: "produto",
            attributes: ["nome"],
            required: true,
          },
        ],
        group: ["ItemVenda.produto_id", "produto.id"],
        order: [[fn("SUM", col("quantidade")), "DESC"]],
        raw: true,
      });

      return res.status(200).json({
        data: hoje,
        quantidade_vendas,
        faturamento_total: faturamento_total || 0,
        ticket_medio,
        produto_mais_vendido,
      });
    } catch (error) {
      return res.status(500).json({
        mensagem: "Erro ao gerar dashboard.",
        erro: error.message,
      });
    }
  }
}
module.exports = new VendaController();
