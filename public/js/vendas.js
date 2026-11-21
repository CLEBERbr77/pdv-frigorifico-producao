const API_URL = "";

// Elementos da página
const campoBusca = document.getElementById("busca-produto");
const listaProdutos = document.getElementById("lista-produtos-venda");
// Elementos de pagamento
const formaPagamento = document.getElementById("forma-pagamento");
const campoDinheiro = document.getElementById("campo-dinheiro-recebido");
const campoTroco = document.getElementById("campo-troco");
const dinheiroRecebido = document.getElementById("dinheiro-recebido");
const valorTroco = document.getElementById("valor-troco");

// Elementos do comprovante
const comprovanteContainer = document.getElementById("comprovante-container");

const conteudoComprovante = document.getElementById("conteudo-comprovante");

const botaoImprimir = document.getElementById("imprimir-comprovante");

let produtosCarregados = [];
// Produtos adicionados ao carrinho
let carrinho = [];
// Formata valores monetários
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Formata unidades de medida
function formatarQuantidade(quantidade, unidade) {
  const casasDecimais = unidade === "kg" ? 3 : 0;

  return `${Number(quantidade).toLocaleString("pt-BR", {
    maximumFractionDigits: casasDecimais,
  })} ${unidade}`;
}

// Carrega a data atual
function carregarData() {
  document.getElementById("data-atual").textContent =
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
}

function formatarFormaPagamento(forma) {
  const formas = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    cartao_credito: "Cartão de crédito",
    cartao_debito: "Cartão de débito",
  };

  return formas[forma] || forma;
}

function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, (caractere) => {
    const caracteres = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return caracteres[caractere];
  });
}

function gerarComprovante(venda) {
  const dataVenda = venda.createdAt
    ? new Date(venda.createdAt).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  const itensHTML = venda.itens
    .map((item) => {
      const nome = escaparHTML(item.produto?.nome || "Produto");

      const quantidade = formatarQuantidade(
        Number(item.quantidade),
        item.produto?.unidade_medida,
      );

      return `
        <div class="comprovante-item">
          <strong>${nome}</strong>
          <div>
            ${quantidade} x ${formatarMoeda(item.preco_unitario)}
            <span>${formatarMoeda(item.subtotal)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  const pagamento = formatarFormaPagamento(venda.forma_pagamento);

  conteudoComprovante.innerHTML = `
    <div class="comprovante">
      <h3>FRIGORÍFICO</h3>
      <p>Comprovante de venda</p>

      <hr>

      <p><strong>Venda:</strong> #${venda.id}</p>
      <p><strong>Data:</strong> ${dataVenda}</p>

      <hr>

      <h4>Produtos</h4>
      ${itensHTML}

      <hr>

      <p><strong>Total:</strong> ${formatarMoeda(venda.valor_total)}</p>
      <p><strong>Pagamento:</strong> ${pagamento}</p>

      ${
        venda.forma_pagamento === "dinheiro"
          ? `
            <p><strong>Valor recebido:</strong> ${formatarMoeda(venda.valor_recebido)}</p>
            <p><strong>Troco:</strong> ${formatarMoeda(venda.troco)}</p>
          `
          : ""
      }
    </div>
  `;

  comprovanteContainer.hidden = false;

  comprovanteContainer.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Busca os produtos no backend
async function carregarProdutos() {
  try {
    const resposta = await fetch(`${API_URL}/produtos`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    produtosCarregados = await resposta.json();

    renderizarProdutos(produtosCarregados);
  } catch (error) {
    console.error(error);

    listaProdutos.innerHTML = `
      <tr>
        <td colspan="5" class="mensagem-vazia">
          Erro ao carregar produtos.
        </td>
      </tr>
    `;
  }
}

// Renderiza os produtos disponíveis
function renderizarProdutos(produtos) {
  const produtosAtivos = produtos.filter((produto) => produto.ativo);

  if (produtosAtivos.length === 0) {
    listaProdutos.innerHTML = `
      <tr>
        <td colspan="5" class="mensagem-vazia">
          Nenhum produto disponível.
        </td>
      </tr>
    `;
    return;
  }

  listaProdutos.innerHTML = produtosAtivos
    .map(
      (produto) => `
    <tr>
      <td><strong>${produto.nome}</strong></td>
      <td>${produto.codigo_produto}</td>
      <td>${formatarMoeda(produto.preco)}</td>
      <td>${formatarQuantidade(
        produto.estoque,
        produto.unidade_medida || "kg",
      )}</td>
      <td>
       <button
  class="botao-principal"
  type="button"
  onclick="adicionarAoCarrinho(${produto.id})"
>
  Adicionar
</button>
      </td>
    </tr>
  `,
    )
    .join("");
}
// Adiciona um produto ao carrinho
function adicionarAoCarrinho(id) {
  const produto = produtosCarregados.find((item) => item.id === id);

  if (!produto) {
    return;
  }

  if (Number(produto.estoque) <= 0) {
    alert("Produto sem estoque disponível.");
    return;
  }

  const itemExistente = carrinho.find((item) => item.produto_id === id);

  if (itemExistente) {
    const quantidadeAtual = Number(itemExistente.quantidade);
    const quantidadeMaxima = Number(produto.estoque);

    const incremento = itemExistente.unidade_medida === "kg" ? 0.1 : 1;
    const novaQuantidade = quantidadeAtual + incremento;

    if (novaQuantidade > quantidadeMaxima) {
      alert("Quantidade superior ao estoque disponível.");
      return;
    }

    itemExistente.quantidade = Number(novaQuantidade.toFixed(3));
  } else {
    carrinho.push({
      produto_id: produto.id,
      nome: produto.nome,
      preco: Number(produto.preco),
      unidade_medida: produto.unidade_medida || "kg",
      estoque: Number(produto.estoque),
      quantidade: produto.unidade_medida === "kg" ? 0.1 : 1,
    });
  }

  renderizarCarrinho();
}
// Renderiza os produtos do carrinho
function renderizarCarrinho() {
  const listaCarrinho = document.getElementById("lista-carrinho");
  calcularTroco();
  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = `
      <tr>
        <td colspan="5" class="mensagem-vazia">
          Nenhum produto adicionado ao carrinho.
        </td>
      </tr>
    `;

    document.getElementById("valor-total").textContent = formatarMoeda(0);

    return;
  }

  listaCarrinho.innerHTML = carrinho
    .map((item) => {
      const subtotal = item.quantidade * item.preco;

      return `
      <tr>
        <td><strong>${item.nome}</strong></td>
        <td>
          <input
            type="number"
            min="${item.unidade_medida === "kg" ? "0.001" : "1"}"
            step="${item.unidade_medida === "kg" ? "0.001" : "1"}"
            value="${item.quantidade}"
            onchange="alterarQuantidade(${item.produto_id}, this.value)"
          >
        </td>
        <td>${formatarMoeda(item.preco)}</td>
        <td>${formatarMoeda(subtotal)}</td>
        <td>
          <button
            type="button"
            class="botao-excluir"
            onclick="removerDoCarrinho(${item.produto_id})"
          >
            Remover
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  const total = carrinho.reduce(
    (soma, item) => soma + item.quantidade * item.preco,
    0,
  );

  document.getElementById("valor-total").textContent = formatarMoeda(total);
}
// Altera a quantidade de um produto
function alterarQuantidade(id, valor) {
  const item = carrinho.find((produto) => produto.produto_id === id);

  if (!item) return;

  const quantidade = Number(valor);
  const quantidadeMinima = item.unidade_medida === "kg" ? 0.001 : 1;

  if (
    !Number.isFinite(quantidade) ||
    quantidade < quantidadeMinima ||
    (item.unidade_medida !== "kg" && !Number.isInteger(quantidade))
  ) {
    alert("Informe uma quantidade válida.");
    renderizarCarrinho();
    return;
  }

  if (quantidade > item.estoque) {
    alert("Quantidade superior ao estoque disponível.");
    renderizarCarrinho();
    return;
  }

  item.quantidade = quantidade;
  renderizarCarrinho();
}

// Remove um produto do carrinho
function removerDoCarrinho(id) {
  carrinho = carrinho.filter((item) => item.produto_id !== id);

  renderizarCarrinho();
}
// Pesquisa por nome ou código
function filtrarProdutos() {
  const busca = campoBusca.value.toLowerCase().trim();

  const produtosFiltrados = produtosCarregados.filter((produto) => {
    return (
      produto.ativo &&
      (produto.nome.toLowerCase().includes(busca) ||
        produto.codigo_produto.toLowerCase().includes(busca))
    );
  });

  renderizarProdutos(produtosFiltrados);
}
// Controla os campos de pagamento
function atualizarPagamento() {
  const pagamentoEmDinheiro = formaPagamento.value === "dinheiro";

  campoDinheiro.hidden = !pagamentoEmDinheiro;
  campoTroco.hidden = !pagamentoEmDinheiro;

  if (!pagamentoEmDinheiro) {
    dinheiroRecebido.value = "";
    valorTroco.textContent = formatarMoeda(0);
  }

  calcularTroco();
}

// Calcula o troco automaticamente
function calcularTroco() {
  const total = carrinho.reduce(
    (soma, item) => soma + item.quantidade * item.preco,
    0,
  );

  const recebido = Number(dinheiroRecebido.value);
  const troco = recebido - total;

  valorTroco.textContent = formatarMoeda(recebido >= total ? troco : 0);
}

// Finaliza a venda
async function finalizarVenda() {
  if (carrinho.length === 0) {
    alert("Adicione pelo menos um produto ao carrinho.");
    return;
  }

  const pagamento = formaPagamento.value;

  if (!pagamento) {
    alert("Selecione uma forma de pagamento.");
    return;
  }

  const total = carrinho.reduce(
    (soma, item) => soma + item.quantidade * item.preco,
    0,
  );

  const recebido = Number(dinheiroRecebido.value);

  if (pagamento === "dinheiro" && recebido < total) {
    alert("O valor recebido é menor que o total da venda.");
    return;
  }

  const dadosVenda = {
    forma_pagamento: pagamento,
    valor_recebido: pagamento === "dinheiro" ? recebido : 0,
    itens: carrinho.map((item) => ({
      produto_id: item.produto_id,
      quantidade: item.quantidade,
    })),
  };

  try {
    const resposta = await fetch(`${API_URL}/vendas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosVenda),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.erro || dados.mensagem || "Erro ao realizar venda.",
      );
    }

    gerarComprovante(dados.venda);

    carrinho = [];
    dinheiroRecebido.value = "";
    formaPagamento.value = "";

    atualizarPagamento();
    renderizarCarrinho();

    await carregarProdutos();
  } catch (error) {
    console.error(error);
    alert(error.message || "Erro ao finalizar venda.");
  }
}

// Eventos
campoBusca.addEventListener("input", filtrarProdutos);
formaPagamento.addEventListener("change", atualizarPagamento);
dinheiroRecebido.addEventListener("input", calcularTroco);
document
  .getElementById("finalizar-venda")
  .addEventListener("click", finalizarVenda);
botaoImprimir.addEventListener("click", () => {
  const janela = window.open("", "_blank");

  if (!janela) {
    alert("Permita a abertura de janelas pop-up para imprimir.");
    return;
  }

  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Comprovante de venda</title>

        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          body {
            width: 72mm;
            margin: 0;
            padding: 2mm;
            color: #000;
            background: #fff;
            font-family: "Courier New", monospace;
            font-size: 11px;
            line-height: 1.4;
          }

          .comprovante {
            width: 100%;
          }

          h3 {
            text-align: center;
            font-size: 17px;
            margin: 0 0 3px;
          }

          h4 {
            margin: 8px 0 6px;
          }

          p {
            display: block;
            margin: 3px 0;
          }

          .comprovante > p:first-of-type {
            text-align: center;
          }

          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 8px 0;
          }

          .comprovante-item {
            margin-bottom: 9px;
            break-inside: avoid;
          }

          .comprovante-item strong {
            display: block;
          }

          .comprovante-item > div {
            display: flex;
            justify-content: space-between;
            gap: 4px;
          }

          .comprovante-item span {
            white-space: nowrap;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        ${conteudoComprovante.innerHTML}
      </body>
    </html>
  `);

  janela.document.close();

  janela.addEventListener("afterprint", () => {
    janela.close();
  });

  janela.onload = () => {
    janela.focus();

    setTimeout(() => {
      janela.print();
    }, 300);
  };
});

// Inicialização
carregarData();
carregarProdutos();
