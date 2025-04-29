const favoritosContainer = document.getElementById("favoritos-container");

// Função para carregar os exercícios favoritos
function carregarFavoritos() {
  const treinos = JSON.parse(localStorage.getItem("meusTreinos")) || {};

  if (Object.keys(treinos).length === 0) {
    favoritosContainer.innerHTML = `
      <div class="col-12">
        ${showNoFavoritesAnimation()}
      </div>
    `;
    return;
  }

  // Variável para juntar todos os cards em uma string
  let html = "";

  Object.entries(treinos).forEach(([treinoNome, treino]) => {
    html += `<h3 class="col-12 my-2 text-3xl font-bold">Treino ${treinoNome}</h3>`;

    treino.forEach((exercicio) => {
      html += createCard(exercicio, treinoNome);
    });
  });

  favoritosContainer.innerHTML = html;
}

// Função para criar o HTML do card
function createCard(exercicio, treinoNome) {
  return `
    <div class="col-md-4 col-lg-3 mb-4">
      <div class="card h-100">
        <img src="${exercicio.imagem}" class="card-img-top h-[150px] w-[100] object-cover object-center"onerror="this.src='assets/sem-imagem.png'" alt="${exercicio.nome}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${exercicio.nome}</h5>
          <button class="btn btn-danger mt-auto" onclick="removerExercicio(${exercicio.id}, '${treinoNome}')">
            Remover
          </button>
        </div>
      </div>
    </div>
  `;
}

// Função para remover um exercício do treino
function removerExercicio(id, treinoNome) {
  let treinos = JSON.parse(localStorage.getItem("meusTreinos")) || {};

  if (!treinos[treinoNome]) return;

  // Remove o exercício do treino selecionado
  treinos[treinoNome] = treinos[treinoNome].filter((ex) => ex.id !== id);

  // Se o treino ficar vazio, remove o treino inteiro
  if (treinos[treinoNome].length === 0) {
    delete treinos[treinoNome];
  }

  localStorage.setItem("meusTreinos", JSON.stringify(treinos));
  carregarFavoritos(); // Atualiza a lista na tela
}

// Carregar favoritos ao carregar a página
document.addEventListener("DOMContentLoaded", carregarFavoritos);

function showNoFavoritesAnimation() {
  return `
    <div class="no-favorites-container">
      <div class="dumbbell-spinner">
        <div class="dumbbell">
          <div class="dumbbell-bar"></div>
          <div class="dumbbell-weight left"></div>
          <div class="dumbbell-weight right"></div>
        </div>
      </div>
      <div class="no-favorites-text">Nenhum exercício favoritado ainda</div>
      <div class="no-favorites-subtext">Adicione favoritos na página de exercícios</div>
    </div>
  `;
}