const listElement = document.getElementById("exercise-list");
const apiUrl = "https://wger.de/api/v2/exerciseinfo/";

async function fetchExercises(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    data.results.forEach((exercise) => {
      const translation = exercise.translations.find((t) => t.language === 2);
      const name = translation ? translation.name : "Sem nome em inglês";
      const category = exercise.category?.name || "Sem categoria";

      const li = document.createElement("li");
      li.textContent = `${name} - Categoria: ${category}`;
      listElement.appendChild(li);
    });

    if (data.next) {
      fetchExercises(data.next); // paginação
    }
  } catch (error) {
    console.error("Erro ao buscar os exercícios:", error);
  }
}

fetchExercises(apiUrl);
