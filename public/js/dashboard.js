const API_URL = "http://localhost:3003";

async function carregarDashboard() {
  try {
    const resposta = await fetch(`${API_URL}/vendas/dashboard`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar dados do dashboard.");
    }

    const dados = await resposta.json();

    document.getElementById("quantidade-vendas").textContent =
      dados.quantidade_vendas;

    document.getElementById("faturamento-total").textContent = formatarMoeda(
      dados.faturamento_total,
    );

    document.getElementById("ticket-medio").textContent = formatarMoeda(
      dados.ticket_medio,
    );

    document.getElementById("produto-mais-vendido").textContent =
      dados.produto_mais_vendido?.["produto.nome"] || "---";
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function carregarData() {
  const data = new Date();

  document.getElementById("data-atual").textContent = data.toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

async function carregarEstoqueBaixo() {
  const lista = document.getElementById("lista-estoque-baixo");

  try {
    const resposta = await fetch(`${API_URL}/produtos/estoque-baixo`);

    if (!resposta.ok) {
      throw new Error("Erro ao buscar estoque baixo.");
    }

    const dados = await resposta.json();

    if (dados.produtos.length === 0) {
      lista.innerHTML = `
        <p class="mensagem-vazia">
          Nenhum produto com estoque baixo.
        </p>
      `;
      return;
    }

    lista.innerHTML = dados.produtos
      .map(
        (produto) => `
      <div class="produto-estoque">
        <div>
          <strong>${produto.nome}</strong>
          <small>Código: ${produto.codigo_produto}</small>
        </div>

        <div class="estoque-info">
          <strong>${Number(produto.estoque).toFixed(3)} kg</strong>
          <small>Mínimo: ${Number(produto.estoque_minimo).toFixed(3)} kg</small>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Erro ao carregar estoque baixo:", error);

    lista.innerHTML = `
      <p class="mensagem-vazia">
        Não foi possível carregar o estoque.
      </p>
    `;
  }
}

carregarData();
carregarDashboard();
carregarEstoqueBaixo();
