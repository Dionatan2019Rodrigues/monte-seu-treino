// constantes da api e elementos da pagina
const API_BASE = "https://wger.de/api/v2";
const container = document.getElementById("cards-container");
const loading = document.getElementById("loading");
const paginacao = document.getElementById("paginacao");
const paginaTexto = document.getElementById("pagina-atual");

// controle de paginacao
let paginaAtual = 1;
const itensPorPagina = 20;

// mapeamento de categorias traduzidas
const categoryMap = {
  abdominais: 10, // IDs reais das categorias na API
  bracos: 8,
  costas: 12,
  panturrilhas: 14,
  cardio: 15,
  peito: 11,
  pernas: 9,
  ombros: 13,
};

const translationMap = {
  Abs: "Abdominais",
  Arms: "Braços",
  Back: "Costas",
  Calves: "Panturrilhas",
  Cardio: "Cardio",
  Chest: "Peito",
  Legs: "Pernas",
  Shoulders: "Ombros",
};

function translateCategory(categoryName) {
  return translationMap[categoryName] || categoryName;
}

// Objeto para armazenar os filtros ativos
let activeFilters = {};

// Adiciona eventos aos checkboxes de filtro
document.querySelectorAll(".form-check-input").forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    const filterId = this.id;
    activeFilters[filterId] = this.checked;
    paginaAtual = 1; // Reset para a primeira página ao aplicar filtro
    showCards();
  });
});

// busca os exercicios com filtros aplicados
async function fetchExercises() {
  const offset = (paginaAtual - 1) * itensPorPagina;
  let url = `${API_BASE}/exerciseinfo/?language=7&limit=${itensPorPagina}&offset=${offset}`;

  // Verifica se há filtros ativos
  const activeCategoryIds = Object.entries(activeFilters)
    .filter(([_, isActive]) => isActive)
    .map(([category, _]) => categoryMap[category]);

  if (activeCategoryIds.length > 0) {
    // Para múltiplas categorias, precisamos fazer uma requisição para cada
    // pois a API não suporta múltiplos IDs na query string
    const promises = activeCategoryIds.map((categoryId) =>
      fetch(`${url}&category=${categoryId}`).then((res) => res.json())
    );

    const results = await Promise.all(promises);
    // Juntamos todos os resultados e removemos duplicados
    const exercises = results.flatMap((r) => r.results);
    const uniqueExercises = exercises.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );
    return uniqueExercises;
  }

  // Se não houver filtros, faz a requisição normal
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

// busca as imagens dos exercicios
async function fetchExerciseImages() {
  const res = await fetch(`${API_BASE}/exerciseimage/?limit=100`);
  const data = await res.json();
  return data.results;
}

// cria o html do card
function createCard(exercise, imageUrl) {
  return `
    <div class="col">
      <div class="card h-100">
        <img src="${
          imageUrl || "assets/sem-imagem.png"
        }" class="card-img-top" alt="${exercise.name}">
        <div class="card-body">
          <span class="badge bg-dark mb-2">${translateCategory(
            exercise.category.name
          )}</span>
          <h5 class="card-title">${exercise.name}</h5>
          <p class="card-text">${exercise.description || "Sem descrição."}</p>
          <button class="btn btn-success px-6" type="button" data-bs-toggle="modal" data-bs-target="#modalTreino">
            <i class="fa-regular fa-star"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// exibe os cards dos exercicios
async function showCards() {
  loading.style.display = "block";
  container.innerHTML = "";
  paginacao.style.display = "none";

  try {
    const [exercises, images] = await Promise.all([
      fetchExercises(),
      fetchExerciseImages(),
    ]);

    if (exercises.length === 0) {
      container.innerHTML =
        '<div class="col-12"><p class="text-center">Nenhum exercício encontrado com os filtros selecionados.</p></div>';
    } else {
      exercises.forEach((exercise) => {
        const image = images.find((img) => img.exercise === exercise.id);
        container.innerHTML += createCard(exercise, image?.image);
      });
    }

    loading.style.display = "none";
    paginacao.style.display = exercises.length > 0 ? "block" : "none";
    paginaTexto.textContent = `Página ${paginaAtual}`;
  } catch (error) {
    console.error("Erro ao carregar exercícios:", error);
    container.innerHTML =
      '<div class="col-12"><p class="text-center">Ocorreu um erro ao carregar os exercícios.</p></div>';
    loading.style.display = "none";
  }
}

// botoes de paginacao
document.getElementById("anterior").addEventListener("click", () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    showCards();
  }
});

document.getElementById("proximo").addEventListener("click", () => {
  paginaAtual++;
  showCards();
});

// inicializa os cards ao carregar a pagina
showCards();
