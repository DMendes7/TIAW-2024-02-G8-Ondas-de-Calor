// Função para exibir imagem de perfil do usuário logado ou link de login no header
document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const loginLink = document.getElementById("loginLink");
  const profileImage = document.createElement("img");

  if (usuarioLogado) {
    loginLink.style.display = "none";
    profileImage.src =
      usuarioLogado.profileImage || "/telausuario/img/user-img/user-img.png";
    profileImage.alt = "Imagem do Usuário";
    profileImage.className = "profile-image";
    profileImage.addEventListener("click", () => {
      window.location.href = "/codigo/telausuario/telausuario.html";
    });
    const headerRight = document.querySelector(".header-right");
    headerRight.appendChild(profileImage);
  }

  if (window.location.pathname.includes("listagem.html")) {
    listarVendedores();
    configurarFiltros();
  }
});

// Função para listar vendedores com filtro
async function listarVendedores(filtro = []) {
  try {
    const response = await fetch("http://localhost:3000/vendedores");
    if (response.ok) {
      const vendedores = await response.json();
      const vendedoresTableBody = document.getElementById(
        "vendedoresTableBody"
      );

      vendedoresTableBody.innerHTML = "";

      if (vendedores.length === 0) {
        vendedoresTableBody.innerHTML =
          "<tr><td colspan='7'>Nenhum vendedor cadastrado.</td></tr>";
        return;
      }

      vendedores.forEach((vendedor) => {
        const itensVenda = vendedor["itens-venda"] || "";
        const itensVendaArray = itensVenda.split(", ");

        // Aplica o filtro: Exibe apenas vendedores que possuem o item selecionado
        if (
          filtro.length > 0 &&
          !filtro.every((item) => itensVendaArray.includes(item))
        ) {
          return;
        }

        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${vendedor.id}</td>
                    <td>${vendedor.name}</td>
                    <td>${vendedor.email}</td>
                    <td>${vendedor.phone}</td>
                    <td>${vendedor.location}</td>
                    <td><img src="Imagem/delete.png" alt="Excluir" class="delete-img" data-id="${vendedor.id}"></td>
                `;
        row.addEventListener("click", () => {
          exibirDetalhesVendedor(vendedor);
        
          geocodeAddress(vendedor.location, function (lat, lon) {
            const mapElementId = "map";
            const mapFunctions = renderGoogleMap(lat, lon, mapElementId);

            // Example usage of searchCategory function
            // mapFunctions.searchCategory('restaurant');
          });
        });
        vendedoresTableBody.appendChild(row);
      });

      const deleteImages = document.querySelectorAll(".delete-img");
      deleteImages.forEach((img) => {
        img.addEventListener("click", async (event) => {
          event.stopPropagation();
          const id = event.target.dataset.id;
          await confirmarExclusao(id);
        });
      });
    } else {
      console.error("Erro ao obter vendedores:", response.status);
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor:", error);
  }
}

function geocodeAddress(address, callback) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      const location = results[0].geometry.location;
      callback(location.lat(), location.lng());
    } else {
      console.error(
        "Geocode was not successful for the following reason: " + status
      );
    }
  });
}

// Função para configurar os filtros
function configurarFiltros() {
  const filtros = document.querySelectorAll(".filtro-item-venda");
  const filtroSelecionado = [];

  filtros.forEach((img) => {
    img.addEventListener("click", () => {
      const valor = img.getAttribute("data-value");

      // Alterna a seleção
      if (img.classList.contains("selecionado")) {
        img.classList.remove("selecionado");
        const index = filtroSelecionado.indexOf(valor);
        if (index > -1) {
          filtroSelecionado.splice(index, 1);
        }
      } else {
        img.classList.add("selecionado");
        filtroSelecionado.push(valor);
      }

      // Atualiza a listagem com o filtro aplicado
      listarVendedores(filtroSelecionado);
    });
  });
}

function exibirDetalhesVendedor(vendedor) {
  const detalhesContainer = document.getElementById("container-modal");
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);

  // Exibe as informações do vendedor
  document.getElementById(
    "detalhesNome"
  ).textContent = `Nome: ${vendedor.name}`;
  document.getElementById("detalhesNome").style.color = "#000";
  document.getElementById(
    "detalhesEmail"
  ).textContent = `Email: ${vendedor.email}`;
  document.getElementById("detalhesEmail").style.color = "#000";
  document.getElementById(
    "detalhesTelefone"
  ).textContent = `Telefone: ${vendedor.phone}`;
  document.getElementById("detalhesTelefone").style.color = "#000";
  document.getElementById(
    "detalhesLocalizacao"
  ).textContent = `Localização: ${vendedor.location}`;
  document.getElementById("detalhesLocalizacao").style.color = "#000";

  detalhesContainer.style.display = "flex";
  overlay.style.display = "flex";

  // Carrega comentários do vendedor
  carregarComentarios(vendedor.id);

  // Configura o botão de adicionar comentário
  const adicionarComentarioBtn = document.getElementById("adicionarComentario");
  adicionarComentarioBtn.onclick = () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {
      alert("Você precisa estar logado para adicionar um comentário.");
      window.location.href = "/codigo/Login/index.html"; // redireciona para a página de login
    } else {
      mostrarAdicionarComentario();
    }
  };

  const salvarComentarioBtn = document.getElementById("salvarComentario");
  salvarComentarioBtn.onclick = () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const novoComentario = document
      .getElementById("novoComentario")
      .value.trim();
    if (novoComentario) {
      salvarComentarioNoServidor(
        vendedor.id,
        novoComentario,
        usuarioLogado.name
      );
      document.getElementById("novoComentario").value = "";
      document.getElementById("novoComentarioContainer").style.display = "none";
    } else {
      alert("Por favor, escreva um comentário antes de salvar.");
    }
  };

  const cancelarComentarioBtn = document.getElementById("cancelarComentario");
  cancelarComentarioBtn.onclick = () => {
    document.getElementById("novoComentario").value = "";
    document.getElementById("novoComentarioContainer").style.display = "none";
  };

  // Função para fechar detalhes
  function fecharDetalhes() {
    detalhesContainer.style.display = "none";
    overlay.style.display = "none";
    document.body.removeChild(overlay);
  }

  document
    .getElementById("fecharDetalhes")
    .addEventListener("click", fecharDetalhes);
  overlay.addEventListener("click", fecharDetalhes);
}

function mostrarAdicionarComentario() {
  const novoComentarioContainer = document.getElementById(
    "novoComentarioContainer"
  );
  novoComentarioContainer.style.display = "block";
}

async function salvarComentarioNoServidor(idVendedor, textoComentario) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    alert("Você precisa estar logado para comentar.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/comentarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendedorId: idVendedor,
        usuarioId: usuarioLogado.id, // salva o ID do usuário logado
        texto: textoComentario,
      }),
    });

    if (response.ok) {
      alert("Comentário salvo com sucesso!");
      carregarComentarios(idVendedor);
    } else {
      alert("Erro ao salvar o comentário. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao salvar comentário:", error);
    alert("Ocorreu um erro ao salvar o comentário.");
  }
}

async function carregarComentarios(idVendedor) {
  try {
    const response = await fetch(
      `http://localhost:3000/comentarios?vendedorId=${idVendedor}`
    );
    const comentarios = await response.json();
    const comentariosLista = document.getElementById("comentariosLista");
    comentariosLista.innerHTML = "";

    if (comentarios.length === 0) {
      comentariosLista.innerHTML = "<p>Sem comentários ainda.</p>";
    } else {
      for (const comentario of comentarios) {
        const usuarioResponse = await fetch(
          `http://localhost:3000/usuarios/${comentario.usuarioId}`
        );
        const usuario = await usuarioResponse.json();

        const nomeUsuario = usuario.nome || "Usuário Desconhecido";
        const imagemPerfil =
          usuario.profileImage || "/telausuario/img/user-img/user-img.png";

        const comentarioElem = document.createElement("div");
        comentarioElem.classList.add("comentario-item");

        comentarioElem.innerHTML = `
                    <div class="comentario-header">
                        <img src="${imagemPerfil}" alt="Imagem de ${nomeUsuario}" class="comentario-imagem">
                        <span class="comentario-nome">${nomeUsuario}</span>
                    </div>
                    <p class="comentario-texto">${comentario.texto}</p>
                `;

        comentariosLista.appendChild(comentarioElem);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar comentários:", error);
    comentariosLista.innerHTML = "<p>Erro ao carregar comentários.</p>";
  }
}

// Função para confirmar a exclusão de um vendedor
async function confirmarExclusao(id) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    alert("Você precisa estar logado para excluir um vendedor.");
    return;
  }

  const confirmacao = confirm("Tem certeza que deseja excluir este vendedor?");
  if (confirmacao) {
    await excluirVendedor(id);
  }
}

// Função para excluir um vendedor
async function excluirVendedor(id) {
  try {
    await excluirComentariosDoVendedor(id);
    const response = await fetch(`http://localhost:3000/vendedores/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Vendedor excluído com sucesso!");
      listarVendedores();
    } else {
      alert("Erro ao excluir o vendedor. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao excluir vendedor:", error);
    alert("Ocorreu um erro ao excluir o vendedor.");
  }
}

async function excluirComentariosDoVendedor(vendedorId) {
  try {
    const response = await fetch(
      `http://localhost:3000/comentarios?vendedorId=${vendedorId}`
    );
    if (response.ok) {
      const comentarios = await response.json();
      for (let comentario of comentarios) {
        await fetch(`http://localhost:3000/comentarios/${comentario.id}`, {
          method: "DELETE",
        });
      }
    } else {
      console.error("Erro ao buscar comentários:", response.status);
    }
  } catch (error) {
    console.error("Erro ao excluir comentários do vendedor:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const itensVenda = document.querySelectorAll(".item-venda-img");
  const selecionados = [];

  itensVenda.forEach((img) => {
    img.addEventListener("click", () => {
      const valor = img.getAttribute("data-value");

      // Alterna a seleção
      if (img.classList.contains("selecionado")) {
        img.classList.remove("selecionado");
        const index = selecionados.indexOf(valor);
        if (index > -1) {
          selecionados.splice(index, 1);
        }
      } else {
        img.classList.add("selecionado");
        selecionados.push(valor);
      }

      console.log("Itens selecionados:", selecionados);
    });
  });
});

async function cadastrarVendedor() {
  console.log("Iniciando cadastro...");

  const name = document.querySelector("#name").value.trim();
  const email = document.querySelector("#email").value.trim();
  const phone = document.querySelector("#phone").value.trim();
  const city = document.querySelector("#city").value.trim();
  const street = document.querySelector("#street").value.trim();
  const number = document.querySelector("#number").value.trim();
  const itensSelecionados = document.querySelectorAll(
    ".item-venda-img.selecionado"
  );

  // Verificação de preenchimento dos campos
  if (!name || !email || !phone || !city || !street || !number) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  // Captura os itens de venda selecionados
  const itensVenda = Array.from(itensSelecionados)
    .map((img) => img.getAttribute("data-value"))
    .join(", ");

  const vendedor = {
    id: gerarIdVendedor(),
    name,
    email,
    phone,
    location: `${city}, ${street}, ${number}`,
    "itens-venda": itensVenda,
  };

  console.log("Dados do vendedor:", vendedor);

  try {
    const response = await fetch("http://localhost:3000/vendedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendedor),
    });

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "/codigo/vendedores/listagem.html";
      limparFormulario();
    } else {
      alert("Erro ao cadastrar vendedor. Tente novamente.");
      console.error("Erro na resposta do servidor:", response.status);
    }
  } catch (error) {
    console.error("Erro ao cadastrar vendedor:", error);
    alert("Ocorreu um erro ao cadastrar o vendedor.");
  }
}

function gerarIdVendedor() {
  return Math.random().toString(36).substr(2, 4);
}

function limparFormulario() {
  document.querySelector("#name").value = "";
  document.querySelector("#email").value = "";
  document.querySelector("#phone").value = "";
  document.querySelector("#city").value = "";
  document.querySelector("#street").value = "";
  document.querySelector("#number").value = "";
  document
    .querySelectorAll(".item-venda-img")
    .forEach((img) => img.classList.remove("selecionado"));
  console.log("Formulário limpo.");
}

// Vinculação do evento de clique
document.addEventListener("DOMContentLoaded", () => {
  const botaoCadastrar = document.querySelector("#submit");
  if (botaoCadastrar) {
    botaoCadastrar.addEventListener("click", (event) => {
      event.preventDefault();
      cadastrarVendedor();
    });
    console.log("Evento de clique vinculado ao botão de cadastro.");
  } else {
    console.error("Botão de cadastro não encontrado.");
  }
});
