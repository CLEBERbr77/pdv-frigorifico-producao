const API_URL = "";

// Elementos da página
const formulario = document.getElementById("formulario-categoria");
const campoId = document.getElementById("categoria-id");
const campoNome = document.getElementById("nome");
const campoDescricao = document.getElementById("descricao");
const listaCategorias = document.getElementById("lista-categorias");

// Carrega a data atual
function carregarData() {
  document.getElementById("data-atual").textContent =
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
}

// Carrega as categorias cadastradas
async function carregarCategorias() {
  try {
    const resposta = await fetch(`${API_URL}/categorias`);

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar as categorias.");
    }

    const categorias = await resposta.json();

    if (categorias.length === 0) {
      listaCategorias.innerHTML = `
        <tr>
          <td colspan="4" class="mensagem-vazia">
            Nenhuma categoria cadastrada.
          </td>
        </tr>
      `;
      return;
    }

    listaCategorias.innerHTML = categorias
      .map(
        (categoria) => `
      <tr>
        <td>${categoria.id}</td>
        <td><strong>${categoria.nome}</strong></td>
        <td>${categoria.descricao || "---"}</td>
        <td>
          <button
            class="botao-editar"
            onclick="editarCategoria(${categoria.id})"
          >
            Editar
          </button>

          <button
            class="botao-excluir"
            onclick="excluirCategoria(${categoria.id})"
          >
            Excluir
          </button>
        </td>
      </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error(error);

    listaCategorias.innerHTML = `
      <tr>
        <td colspan="4" class="mensagem-vazia">
          Erro ao carregar categorias.
        </td>
      </tr>
    `;
  }
}
// Busca uma categoria para edição
async function editarCategoria(id) {
  try {
    const resposta = await fetch(`${API_URL}/categorias/${id}`);

    if (!resposta.ok) {
      throw new Error("Não foi possível buscar a categoria.");
    }

    const categoria = await resposta.json();

    campoId.value = categoria.id;
    campoNome.value = categoria.nome;
    campoDescricao.value = categoria.descricao || "";

    document.getElementById("titulo-formulario").textContent =
      "Editar categoria";

    document.getElementById("botao-salvar").textContent = "Atualizar categoria";

    formulario.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
// Cadastra uma nova categoria
// Cadastra ou atualiza uma categoria
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const id = campoId.value;

  const nome = campoNome.value.trim();
  const descricao = campoDescricao.value.trim();

  const metodo = id ? "PUT" : "POST";

  const url = id ? `${API_URL}/categorias/${id}` : `${API_URL}/categorias`;

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        descricao: descricao || null,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao salvar categoria.");
    }

    alert(dados.mensagem);

    limparFormulario();

    await carregarCategorias();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});
// Limpa o formulário
function limparFormulario() {
  formulario.reset();
  campoId.value = "";

  document.getElementById("titulo-formulario").textContent =
    "Cadastrar categoria";

  document.getElementById("botao-salvar").textContent = "Salvar categoria";
}
// Exclui uma categoria
async function excluirCategoria(id) {
  const confirmar = confirm(
    "Tem certeza de que deseja excluir esta categoria?",
  );

  if (!confirmar) {
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/categorias/${id}`, {
      method: "DELETE",
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao excluir categoria.");
    }

    alert(dados.mensagem);

    await carregarCategorias();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Inicialização
carregarData();
carregarCategorias();
