// JS TESTE PARA OS CARDS DOS EXERCICIOS
const API_BASE = 'https://wger.de/api/v2';
const container = document.getElementById('cards-container');

// Busca os exercícios
async function fetchExercises() {
  const res = await fetch(`${API_BASE}/exercise/?language=2&limit=9`);
  const data = await res.json();
  return data.results;
}

// Busca as imagens de exercícios
async function fetchExerciseImages() {
  const res = await fetch(`${API_BASE}/exerciseimage/?limit=100`);
  const data = await res.json();
  return data.results;
}

function createCard(exercise, imageUrl) {
  return `
    <div class="col">
      <div class="card h-100">
        <img src="${imageUrl}" class="card-img-top" alt="${exercise.name}">
        <div class="card-body">
          <span class="badge bg-dark mb-2">Exercício</span>
          <h5 class="card-title">${exercise.name}</h5>
          <p class="card-text">${exercise.description || 'Sem descrição.'}</p>
          <button class="btn btn-success px-2" type="button" data-bs-toggle="modal" data-bs-target="#modalTreino">
            Adicionar ao meu treino
          </button>
        </div>
      </div>
    </div>
  `;
}

// Junta tudo e exibe os cards
async function showCards() {
  const [exercises, images] = await Promise.all([fetchExercises(), fetchExerciseImages()]);

  exercises.forEach(exercise => {
    const image = images.find(img => img.exercise === exercise.id);
    const imageUrl = image ? image.image : 'assets/exemplo-card.png';
    const cardHTML = createCard(exercise, imageUrl);
    container.innerHTML += cardHTML;
  });
}

showCards();
