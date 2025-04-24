// JS TESTE PARA OS CARDS DOS EXERCICIOS
const API_BASE = "https://wger.de/api/v2";
const container = document.getElementById("cards-container");

// Busca os exercícios
async function fetchExercises() {
  const res = await fetch(`${API_BASE}/exerciseinfo/?language=2&limit=6`);
  const data = await res.json();
  return data.results;
}

// Busca as imagens de exercícios
async function fetchExerciseImages() {
  const res = await fetch(`${API_BASE}/exerciseimage/?limit=6`);
  const data = await res.json();
  return data.results;
}

const translationMap = {
  Abs: "Abdominais",
  Chest: "Peitoral",
  Back: "Costas",
  Legs: "Pernas",
  Shoulders: "Ombros",
  Arms: "Braços",
  Cardio: "Cardio",
};

function translateCategory(categoryName) {
  return translationMap[categoryName] || categoryName;
}

function createCard(exercise, imageUrl) {
  const translation = exercise.translations.find((t) => t.language === 2);
  return `
    <div class="col">
      <div class="card h-100">
      <div class="card-body">
          <span class="badge bg-dark mb-2 p-2">${translateCategory(exercise.category.name)}</span>
          <img src="${imageUrl}" class="card-img-top" style="height:150px; width:250px;" 
            alt="${translateCategory(exercise.category.name)}">
          <h5 class="card-title pt-3 mb-1">${translation.name || "Sem nome."}</h5>
          <button class="btn btn-success px-6" type="button" data-bs-toggle="modal" data-bs-target="#modalTreino">
            <i class="fa-regular fa-star"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Junta tudo e exibe os cards
async function showCards() {
  const [exercises, images] = await Promise.all([
    fetchExercises(),
    fetchExerciseImages(),
  ]);
  console.log(exercises);

  exercises.forEach((exercise) => {
    const image = images.find((img) => img.exercise === exercise.id);
    const imageUrl = image ? image.image : "assets/sem-imagem.png";
    // "https://img.freepik.com/fotos-gratis/full-shot-mulher-com-fones-de-ouvido_23-2149049775.jpg?t=st=1745451291~exp=1745454891~hmac=513f255f04ea7ec7eeb201f994d3e619e4d46b7e2a02d8f68dfe253c3bd54848&w=1380";
    const cardHTML = createCard(exercise, imageUrl);
    container.innerHTML += cardHTML;
  });
}

showCards();
