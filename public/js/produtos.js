const API_URL = "";

// Elementos da página
const formulario = document.getElementById("formulario-produto");
const listaProdutos = document.getElementById("lista-produtos");
const seletorCategoria = document.getElementById("categoria_id");
const campoId = document.getElementById("produto_id");
const campoBusca = document.getElementById("busca-produto");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroStatus = document.getElementById("filtro-status");

let produtosCarregados = [];
// Formata valores monetários
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Formata a unidade de medida
function formatarUnidade(unidade) {
  const unidades = {
    kg: "kg",
    unidade: "un.",
    peca: "peça",
    pacote: "pacote",
  };

  return unidades[unidade] || unidade;
}

// Formata a quantidade em estoque
function formatarEstoque(quantidade, unidade) {
  const casasDecimais = unidade === "kg" ? 3 : 0;

  return `${Number(quantidade).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: casasDecimais,
  })} ${formatarUnidade(unidade)}`;
}

// Evita inserir conteúdo HTML vindo da API diretamente
function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caractere) => {
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

// Carrega as categorias no seletor
async function carregarCategorias() {
  try {
    const resposta = await fetch(`${API_URL}/categorias`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar as categorias.");
    }

    const categorias = await resposta.json();

    // Limpa os dois seletores
    seletorCategoria.innerHTML =
      '<option value="">Selecione uma categoria</option>';

    filtroCategoria.innerHTML = '<option value="">Todas as categorias</option>';

    // Preenche os dois seletores
    categorias.forEach((categoria) => {
      const opcaoCadastro = document.createElement("option");

      opcaoCadastro.value = categoria.id;
      opcaoCadastro.textContent = categoria.nome;

      seletorCategoria.appendChild(opcaoCadastro);

      const opcaoFiltro = document.createElement("option");

      opcaoFiltro.value = categoria.id;
      opcaoFiltro.textContent = categoria.nome;

      filtroCategoria.appendChild(opcaoFiltro);
    });
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function renderizarProdutos(produtos) {
  if (produtos.length === 0) {
    listaProdutos.innerHTML = `
      <tr>
        <td colspan="7" class="mensagem-vazia">
          Nenhum produto encontrado.
        </td>
      </tr>
    `;
    return;
  }

  listaProdutos.innerHTML = produtos
    .map((produto) => {
      const categoria = produto.categoria?.nome || "Sem categoria";
      const unidade = produto.unidade_medida || "kg";

      return `
      <tr>
        <td><strong>${escaparHTML(produto.nome)}</strong></td>
        <td>${escaparHTML(produto.codigo_produto)}</td>
        <td>${escaparHTML(categoria)}</td>
        <td>${formatarMoeda(produto.preco)}</td>
        <td>${formatarEstoque(produto.estoque, unidade)}</td>
        <td>
          <span class="${produto.ativo ? "status-ativo" : "status-inativo"}">
            ${produto.ativo ? "Ativo" : "Inativo"}
          </span>
        </td>
        <td>
          <div class="acoes-produto">
            <button class="botao-acao botao-editar" data-id="${produto.id}" data-acao="editar">Editar</button>
            ${
              produto.ativo
                ? `<button class="botao-acao botao-desativar" data-id="${produto.id}" data-acao="desativar">Desativar</button>`
                : `<button class="botao-acao botao-reativar" data-id="${produto.id}" data-acao="reativar">Reativar</button>`
            }
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}
function filtrarProdutos() {
  const busca = campoBusca.value.toLowerCase().trim();
  const categoriaSelecionada = filtroCategoria.value;
  const statusSelecionado = filtroStatus.value;

  const produtosFiltrados = produtosCarregados.filter((produto) => {
    const correspondeBusca =
      produto.nome.toLowerCase().includes(busca) ||
      produto.codigo_produto.toLowerCase().includes(busca);

    const correspondeCategoria =
      !categoriaSelecionada ||
      String(produto.categoria_id) === categoriaSelecionada;

    const correspondeStatus =
      !statusSelecionado ||
      (statusSelecionado === "ativo" && produto.ativo) ||
      (statusSelecionado === "inativo" && !produto.ativo);

    return correspondeBusca && correspondeCategoria && correspondeStatus;
  });

  renderizarProdutos(produtosFiltrados);
}
// Carrega e exibe os produtos
async function carregarProdutos() {
  try {
    const resposta = await fetch(`${API_URL}/produtos`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar os produtos.");
    }

    const produtos = await resposta.json();

    produtosCarregados = produtos;

    renderizarProdutos(produtosCarregados);
  } catch (error) {
    console.error(error);

    listaProdutos.innerHTML = `
      <tr>
        <td colspan="7" class="mensagem-vazia">
          Erro ao carregar os produtos.
        </td>
      </tr>
    `;
  }
}

// Limpa o formulário e retorna ao modo cadastro
function limparFormulario() {
  formulario.reset();
  campoId.value = "";

  document.getElementById("estoque").value = 0;
  document.getElementById("estoque_minimo").value = 0;
  document.getElementById("unidade_medida").value = "kg";

  formulario.querySelector('button[type="submit"]').textContent =
    "Cadastrar produto";

  document.querySelector(".painel .painel-header h2").textContent =
    "Novo produto";
}

// Prepara o formulário para editar um produto
async function editarProduto(id) {
  try {
    const resposta = await fetch(`${API_URL}/produtos/${id}`);

    if (!resposta.ok) {
      throw new Error("Não foi possível buscar o produto.");
    }

    const produto = await resposta.json();

    campoId.value = produto.id;
    document.getElementById("nome").value = produto.nome;
    document.getElementById("codigo_produto").value = produto.codigo_produto;
    document.getElementById("codigo_barras").value =
      produto.codigo_barras || "";
    document.getElementById("categoria_id").value = produto.categoria_id;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("unidade_medida").value =
      produto.unidade_medida || "kg";
    document.getElementById("estoque").value = produto.estoque;
    document.getElementById("estoque_minimo").value = produto.estoque_minimo;

    formulario.querySelector('button[type="submit"]').textContent =
      "Salvar alterações";

    document.querySelector(".painel .painel-header h2").textContent =
      "Editar produto";

    formulario.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Cadastra ou atualiza um produto
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dadosFormulario = new FormData(formulario);

  const produto = {
    nome: dadosFormulario.get("nome").trim(),
    codigo_produto: dadosFormulario.get("codigo_produto").trim(),
    codigo_barras: dadosFormulario.get("codigo_barras").trim() || null,
    preco: Number(dadosFormulario.get("preco")),
    unidade_medida: dadosFormulario.get("unidade_medida"),
    estoque: Number(dadosFormulario.get("estoque")),
    estoque_minimo: Number(dadosFormulario.get("estoque_minimo")),
    categoria_id: Number(dadosFormulario.get("categoria_id")),
  };

  const id = campoId.value;

  try {
    const resposta = await fetch(
      id ? `${API_URL}/produtos/${id}` : `${API_URL}/produtos`,
      {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produto),
      },
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao salvar produto.");
    }

    alert(dados.mensagem);

    limparFormulario();
    await carregarProdutos();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// Trata os cliques nos botões da tabela
listaProdutos.addEventListener("click", async (evento) => {
  const botao = evento.target.closest("button[data-acao]");

  if (!botao) return;

  const id = botao.dataset.id;
  const acao = botao.dataset.acao;

  // Editar produto
  if (acao === "editar") {
    await editarProduto(id);
    return;
  }

  const confirmar = confirm(
    acao === "desativar"
      ? "Deseja realmente desativar este produto?"
      : "Deseja reativar este produto?",
  );

  if (!confirmar) return;

  const endpoint =
    acao === "reativar"
      ? `${API_URL}/produtos/${id}/reativar`
      : `${API_URL}/produtos/${id}`;

  try {
    const resposta = await fetch(endpoint, {
      method: "PATCH",
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.mensagem || "Não foi possível atualizar o produto.",
      );
    }

    alert(dados.mensagem);
    await carregarProdutos();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// Exibe a data atual
function carregarData() {
  const elementoData = document.getElementById("data-atual");

  if (!elementoData) return;

  elementoData.textContent = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
// Eventos dos filtros
campoBusca.addEventListener("input", filtrarProdutos);

filtroCategoria.addEventListener("change", filtrarProdutos);

filtroStatus.addEventListener("change", filtrarProdutos);

// Inicialização
carregarData();
carregarCategorias();
carregarProdutos();
