const API_URL = "";

// Elementos da página
const formulario = document.getElementById("formulario-movimentacao");
const seletorProduto = document.getElementById("produto_id");

// Formata quantidades conforme a unidade
function formatarQuantidade(quantidade, unidade) {
  const casasDecimais = unidade === "kg" ? 3 : 0;

  return `${Number(quantidade).toLocaleString("pt-BR", {
    maximumFractionDigits: casasDecimais,
  })} ${unidade}`;
}

// Exibe a data atual
function carregarData() {
  const elementoData = document.getElementById("data-atual");

  elementoData.textContent = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Carrega os produtos disponíveis
async function carregarProdutos() {
  try {
    const resposta = await fetch(`${API_URL}/produtos`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    const produtos = await resposta.json();

    seletorProduto.innerHTML = '<option value="">Selecione um produto</option>';

    produtos
      .filter((produto) => produto.ativo)
      .forEach((produto) => {
        const opcao = document.createElement("option");

        opcao.value = produto.id;
        opcao.textContent = `${produto.nome} — Estoque: ${formatarQuantidade(
          produto.estoque,
          produto.unidade_medida || "kg",
        )}`;

        seletorProduto.appendChild(opcao);
      });
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
// Carrega o histórico de movimentações
async function carregarMovimentacoes() {
  const lista = document.getElementById("lista-movimentacoes");

  try {
    const resposta = await fetch(`${API_URL}/movimentacoes-estoque`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar as movimentações.");
    }

    const movimentacoes = await resposta.json();

    if (movimentacoes.length === 0) {
      lista.innerHTML = `
        <tr>
          <td colspan="6" class="mensagem-vazia">
            Nenhuma movimentação registrada.
          </td>
        </tr>
      `;
      return;
    }

    lista.innerHTML = movimentacoes
      .map((movimentacao) => {
        const produto = movimentacao.produto;
        const unidade = produto?.unidade_medida || "kg";

        return `
        <tr>
          <td><strong>${produto?.nome || "Produto não encontrado"}</strong></td>
          <td>${produto?.codigo_produto || "---"}</td>
          <td>${movimentacao.tipo === "entrada" ? "Entrada" : "Saída"}</td>
          <td>${formatarQuantidade(movimentacao.quantidade, unidade)}</td>
          <td>${movimentacao.motivo || "---"}</td>
          <td>${new Date(movimentacao.createdAt).toLocaleString("pt-BR")}</td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error(error);

    lista.innerHTML = `
      <tr>
        <td colspan="6" class="mensagem-vazia">
          Erro ao carregar as movimentações.
        </td>
      </tr>
    `;
  }
}
// Registra uma entrada ou saída de estoque
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const produto_id = Number(seletorProduto.value);
  const quantidade = Number(document.getElementById("quantidade").value);
  const motivo = document.getElementById("motivo").value.trim();

  try {
    const resposta = await fetch(`${API_URL}/movimentacoes-estoque/${tipo}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        produto_id,
        quantidade,
        motivo: motivo || null,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao registrar movimentação.");
    }

    alert(dados.mensagem);

    formulario.reset();

    await carregarProdutos();
    await carregarMovimentacoes();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// Inicialização
carregarData();
carregarProdutos();
carregarMovimentacoes();
