// constantes da api e elementos da pagina
const API_BASE = 'https://wger.de/api/v2';
const container = document.getElementById('cards-container');
const loading = document.getElementById('loading');
const paginacao = document.getElementById('paginacao');
const paginaTexto = document.getElementById('pagina-atual');

// controle de paginacao
let paginaAtual = 1;
const itensPorPagina = 20;

// mapeamento de categorias traduzidas
const translationMap = {
  "Abs": "Abdominais",
  "Chest": "Peitoral",
  "Back": "Costas",
  "Legs": "Pernas",
  "Shoulders": "Ombros",
  "Arms": "Bracos",
  "Cardio": "Cardio",
};

function translateCategory(categoryName) {
  return translationMap[categoryName] || categoryName;
}

// busca os exercicios
async function fetchExercises() {
  const offset = (paginaAtual - 1) * itensPorPagina;
  const res = await fetch(`${API_BASE}/exerciseinfo/?language=7&limit=${itensPorPagina}&offset=${offset}`);
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
        <img src="${imageUrl}" class="card-img-top" alt="${exercise.category.name}">
        <div class="card-body">
          <span class="badge bg-dark mb-2">${translateCategory(exercise.category.name)}</span>
          <h5 class="card-title">${exercise.translations[0]?.name}</h5>
          <p class="card-text">${exercise.translations[0]?.description || 'Sem descricao.'}</p>
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
  loading.style.display = 'block';
  container.innerHTML = '';
  paginacao.style.display = 'none';

  const [exercises, images] = await Promise.all([fetchExercises(), fetchExerciseImages()]);

  exercises.forEach(exercise => {
    const image = images.find(img => img.exercise === exercise.id);
    const imageUrl = image
      ? image.image
      : 'assets/sem-imagem.png';
    container.innerHTML += createCard(exercise, imageUrl);
  });

  loading.style.display = 'none';
  paginacao.style.display = 'block';
  paginaTexto.textContent = `Pagina ${paginaAtual}`;
}

// botoes de paginacao
document.getElementById('anterior').addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    showCards();
  }
});

document.getElementById('proximo').addEventListener('click', () => {
  paginaAtual++;
  showCards();
});

// inicializa os cards ao carregar a pagina
showCards();
