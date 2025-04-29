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
const itensPorPagina = 15;
let searchTerm = '';
let allExercisesCache = [];
let exerciciosAtuais = [];
let exercicioSelecionado = null;

// mapeamento de categorias traduzidas
const categoryMap = {
  abdominais: 10,
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

document.querySelectorAll(".form-check-input").forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    const filterId = this.id;
    activeFilters[filterId] = this.checked;
    paginaAtual = 1;
    showCards();
  });
});

searchForm.addEventListener("submit", function(e) {
  e.preventDefault();
  searchTerm = searchInput.value.trim().toLowerCase();
  paginaAtual = 1;

  if (searchTerm) {
    loadAllExercises().then(() => showCards());
  } else {
    showCards();
  }
});

async function loadAllExercises() {
  loading.style.display = "block";
  container.innerHTML = "";

  try {
    let allExercises = [];
    let nextUrl = `${API_BASE}/exerciseinfo/?language=7&limit=100`;

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

async function fetchExercises() {
  const offset = (paginaAtual - 1) * itensPorPagina;
  let url = `${API_BASE}/exerciseinfo/?language=7&limit=${itensPorPagina}&offset=${offset}`;

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

async function fetchExerciseImages() {
  const res = await fetch(`${API_BASE}/exerciseimage/?limit=200`);
  const data = await res.json();
  return data.results;
}

function filterExercisesByName(exercises, searchTerm) {
  if (!searchTerm) return exercises;

  return exercises.filter(exercise => {
    const translation = exercise.translations?.find(t => t.language === 2) || {};
    const translatedName = translation.name?.toLowerCase() || '';
    return translatedName.includes(searchTerm);
  });
}

function applyCategoryFilters(exercises) {
  const activeCategoryIds = Object.entries(activeFilters)
    .filter(([_, isActive]) => isActive)
    .map(([category, _]) => categoryMap[category]);

  if (activeCategoryIds.length === 0) return exercises;

  return exercises.filter(exercise => 
    activeCategoryIds.includes(exercise.category.id)
  );
}

function createCard(exercise, imageUrl) {
  const translation = exercise.translations?.find(t => t.language === 2) || {};
  return `
    <div class="col">
      <div class="card h-100">
      <div class="card-body">
          <span class="badge bg-dark mb-2 p-2">${translateCategory(exercise.category.name)}</span>
          <img src="${imageUrl || "assets/sem-imagem.png"}" class="card-img-top" style="height:150px; width:250px;" 
            alt="${translateCategory(exercise.category.name)}">
          <h5 class="card-title pt-3 mb-1">${translation.name || "Sem nome."}</h5>
          <button class="btn btn-success px-6 w-100" type="button" data-bs-toggle="modal" data-bs-target="#modalTreino">
            <i class="fa-regular fa-star"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

async function showCards() {
  loading.style.display = "block";
  container.innerHTML = "";
  paginacao.style.display = "none";

  try {
    let exercisesToShow = [];
    const images = await fetchExerciseImages();

    if (searchTerm) {
      exercisesToShow = filterExercisesByName(allExercisesCache, searchTerm);
      exercisesToShow = applyCategoryFilters(exercisesToShow);
    } else {
      exercisesToShow = await fetchExercises();
    }

    exerciciosAtuais = exercisesToShow;

    if (exercisesToShow.length === 0) {
      container.innerHTML = '<div class="col-12"><p class="text-center">Nenhum exercício encontrado com os critérios selecionados.</p></div>';
    } else {
      exercisesToShow.forEach((exercise) => {
        const image = images.find((img) => img.exercise === exercise.id);
        container.innerHTML += createCard(exercise, image?.image);
      });
    }

    loading.style.display = "none";
    paginacao.style.display = searchTerm ? "none" : "block";
    paginaTexto.textContent = `Página ${paginaAtual}`;
  } catch (error) {
    console.error("Erro ao carregar exercícios:", error);
    container.innerHTML = '<div class="col-12"><p class="text-center">Ocorreu um erro ao carregar os exercícios.</p></div>';
    loading.style.display = "none";
  }
}

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

showCards();

// Funções de Favoritar
function favoritarModal(id) {
  exercicioSelecionado = exerciciosAtuais.find(ex => ex.id === id);

  if (!exercicioSelecionado) {
    console.error('Exercício não encontrado!');
    return;
  }

  const modal = new bootstrap.Modal(document.getElementById('modalTreino'));
  modal.show();
}

function adicionarAoTreino() {
  const select = document.getElementById('treinoSelect');
  const treinoSelecionado = select.value;

  if (!treinoSelecionado) {
    alert('Selecione um treino!');
    return;
  }

  let treinos = localStorage.getItem('meusTreinos');
  treinos = treinos ? JSON.parse(treinos) : {};

  if (!treinos[treinoSelecionado]) {
    treinos[treinoSelecionado] = [];
  }

  const jaExiste = treinos[treinoSelecionado].some(ex => ex.id === exercicioSelecionado.id);
  if (jaExiste) {
    alert('Este exercício já foi adicionado a esse treino!');
    return;
  }

  const novoExercicio = {
    id: exercicioSelecionado.id,
    nome: exercicioSelecionado.translations?.find(t => t.language === 2)?.name || exercicioSelecionado.name,
    imagem: exercicioSelecionado.images?.[0]?.image || "assets/sem-imagem.png"
  };

  treinos[treinoSelecionado].push(novoExercicio);

  localStorage.setItem('meusTreinos', JSON.stringify(treinos));

  alert('Exercício adicionado com sucesso!');

  const modal = bootstrap.Modal.getInstance(document.getElementById('modalTreino'));
  modal.hide();
}
