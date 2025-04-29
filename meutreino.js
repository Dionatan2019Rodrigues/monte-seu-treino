// meutreino.js
const favoritosContainer = document.getElementById("favoritos-container");

// Função para carregar os exercícios favoritos
function carregarFavoritos() {
  const treinos = JSON.parse(localStorage.getItem("meusTreinos")) || {};

  if (Object.keys(treinos).length === 0) {
    favoritosContainer.innerHTML = `<div class="col-12"><p class="text-center">Nenhum exercício favorito encontrado.</p></div>`;
    return;
  }

  // Variável para juntar todos os cards em uma string
  let html = '';

  Object.entries(treinos).forEach(([treinoNome, treino]) => {
    html += `<h3 class="col-12 my-4">Treino ${treinoNome}</h3>`; 

    treino.forEach((exercicio) => {
      html += createCard(exercicio, treinoNome);
    });
  });

  favoritosContainer.innerHTML = html;
}

// Função para criar o HTML do card
function createCard(exercicio, treinoNome) {
  return `
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <img src="${exercicio.imagem}" class="card-img-top" alt="${exercicio.nome}">
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
  treinos[treinoNome] = treinos[treinoNome].filter(ex => ex.id !== id);

  // Se o treino ficar vazio, remove o treino inteiro
  if (treinos[treinoNome].length === 0) {
    delete treinos[treinoNome];
  }

  localStorage.setItem("meusTreinos", JSON.stringify(treinos));
  carregarFavoritos(); // Atualiza a lista na tela
}

// Carregar favoritos ao carregar a página
document.addEventListener("DOMContentLoaded", carregarFavoritos);
