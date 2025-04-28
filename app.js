// constantes da api e elementos da pagina
const API_BASE = "https://wger.de/api/v2";
const container = document.getElementById("cards-container");
const loading = document.getElementById("loading");
const paginacao = document.getElementById("paginacao");
const paginaTexto = document.getElementById("pagina-atual");
const searchForm = document.querySelector('form[role="search"]');
const searchInput = document.querySelector('input[type="search"]');

// controle de paginacao
let paginaAtual = 1;
const itensPorPagina = 20;
let searchTerm = '';
let allExercisesCache = []; // Cache para todos os exercícios

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
    paginaAtual = 1;
    showCards();
  });
});

// Adiciona evento ao formulário de busca
searchForm.addEventListener("submit", function(e) {
  e.preventDefault();
  searchTerm = searchInput.value.trim().toLowerCase();
  paginaAtual = 1;
  
  // Se há termo de busca, carrega todos os exercícios
  if (searchTerm) {
    loadAllExercises().then(() => showCards());
  } else {
    showCards();
  }
});

// Carrega TODOS os exercícios (ignorando paginação)
async function loadAllExercises() {
  loading.style.display = "block";
  container.innerHTML = "";
  
  try {
    let allExercises = [];
    let nextUrl = `${API_BASE}/exerciseinfo/?language=7&limit=100`;
    
    // Faz requisições paginadas até obter todos os exercícios
    while (nextUrl) {
      const res = await fetch(nextUrl);
      const data = await res.json();
      allExercises = allExercises.concat(data.results);
      nextUrl = data.next;
    }
    
    allExercisesCache = allExercises;
    return allExercises;
  } catch (error) {
    console.error("Erro ao carregar todos os exercícios:", error);
    return [];
  }
}

// busca os exercicios com filtros aplicados (paginação normal)
async function fetchExercises() {
  const offset = (paginaAtual - 1) * itensPorPagina;
  let url = `${API_BASE}/exerciseinfo/?language=7&limit=${itensPorPagina}&offset=${offset}`;

  // Verifica se há filtros ativos
  const activeCategoryIds = Object.entries(activeFilters)
    .filter(([_, isActive]) => isActive)
    .map(([category, _]) => categoryMap[category]);

  if (activeCategoryIds.length > 0) {
    const promises = activeCategoryIds.map((categoryId) =>
      fetch(`${url}&category=${categoryId}`).then((res) => res.json())
    );

    const results = await Promise.all(promises);
    const exercises = results.flatMap((r) => r.results);
    const uniqueExercises = exercises.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );
    return uniqueExercises;
  }

  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

// busca as imagens dos exercicios
async function fetchExerciseImages() {
  const res = await fetch(`${API_BASE}/exerciseimage/?limit=200`);
  const data = await res.json();
  return data.results;
}

// filtra os exercícios APENAS pelo nome (ignorando descrição)
function filterExercisesByName(exercises, searchTerm) {
  if (!searchTerm) return exercises;
  
  return exercises.filter(exercise => {
    const translation = exercise.translations?.find(t => t.language === 2) || {};
    const translatedName = translation.name?.toLowerCase() || '';
    return translatedName.includes(searchTerm);
  });
}

// aplica filtros de categoria
function applyCategoryFilters(exercises) {
  const activeCategoryIds = Object.entries(activeFilters)
    .filter(([_, isActive]) => isActive)
    .map(([category, _]) => categoryMap[category]);

  if (activeCategoryIds.length === 0) return exercises;

  return exercises.filter(exercise => 
    activeCategoryIds.includes(exercise.category.id)
  );
}

// cria o html do card
function createCard(exercise, imageUrl) {
  const translation = exercise.translations?.find(t => t.language === 2) || {};
  return `
    <div class="col">
      <div class="card h-100">
        <img src="${imageUrl || "assets/sem-imagem.png"}" class="card-img-top" alt="${translation.name || 'Exercício'}">
        <div class="card-body">
          <span class="badge bg-dark mb-2">${translateCategory(exercise.category.name)}</span>
          <h5 class="card-title">${translation.name || "Sem nome."}</h5>
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
    let exercisesToShow = [];
    const images = await fetchExerciseImages();

    if (searchTerm) {
      // Usa o cache de todos os exercícios para busca
      exercisesToShow = filterExercisesByName(allExercisesCache, searchTerm);
      exercisesToShow = applyCategoryFilters(exercisesToShow);
    } else {
      // Modo normal com paginação
      exercisesToShow = await fetchExercises();
    }

    if (exercisesToShow.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center">Nenhum exercício encontrado com os critérios selecionados.</p></div>';
    } else {
      exercisesToShow.forEach((exercise) => {
        const image = images.find((img) => img.exercise === exercise.id);
        container.innerHTML += createCard(exercise, image?.image);
      });
    }

    loading.style.display = "none";
    // Mostra paginação apenas quando não está em modo de busca
    paginacao.style.display = searchTerm ? "none" : "block";
    paginaTexto.textContent = `Página ${paginaAtual}`;
  } catch (error) {
    console.error("Erro ao carregar exercícios:", error);
    container.innerHTML = '<div class="col-12"><p class="text-center">Ocorreu um erro ao carregar os exercícios.</p></div>';
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

// Carrega alguns exercícios inicialmente
showCards();