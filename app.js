const form = document.getElementById("add-form");
const list = document.getElementById("object-list");
const sortSelect = document.getElementById("sort");
const filterBtn = document.getElementById("filter-favorites");

const compareSection = document.getElementById("compare-section");
const compareContainer = document.getElementById("compare-container");
const closeCompareBtn = document.getElementById("close-compare");

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");

let editId = null;
let showFavoritesOnly = false;

let objects = JSON.parse(localStorage.getItem("objects")) || [];
let compareSelection = [];

renderList();

/* ---------------- LÄGG TILL ---------------- */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const imageFile = document.getElementById("image").files[0];
  let imageData = "";

  if (imageFile) {
    imageData = await toBase64(imageFile);
  }

  const newObject = {
    id: Date.now(),
    title: document.getElementById("title").value,
    price: Number(document.getElementById("price").value),
    area: Number(document.getElementById("area").value),
    link: document.getElementById("link").value,
    notes: document.getElementById("notes").value,
    image: imageData,
    favorite: false,
    date: Date.now()
  };

  objects.push(newObject);
  save();
  form.reset();
  renderList();
});

/* ---------------- SORTERING ---------------- */

sortSelect.addEventListener("change", renderList);

/* ---------------- FAVORITFILTER ---------------- */

filterBtn.addEventListener("click", () => {
  showFavoritesOnly = !showFavoritesOnly;
  filterBtn.textContent = showFavoritesOnly ? "Visa alla" : "Visa favoriter";
  renderList();
});

/* ---------------- SPARA ---------------- */

function save() {
  localStorage.setItem("objects", JSON.stringify(objects));
}

/* ---------------- RENDER LISTA ---------------- */

function renderList() {
  list.innerHTML = "";

  let filtered = showFavoritesOnly
    ? objects.filter(o => o.favorite)
    : [...objects];

  switch (sortSelect.value) {
    case "price":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "area":
      filtered.sort((a, b) => b.area - a.area);
      break;
    case "title":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      filtered.sort((a, b) => b.date - a.date);
  }

  filtered.forEach(obj => {
    const card = document.createElement("div");
    card.className = "object-card";

    card.innerHTML = `
      <button class="favorite-btn ${obj.favorite ? "fav" : ""}" onclick="toggleFavorite(${obj.id})">★</button>

      ${obj.image ? `<img src="${obj.image}" alt="Bild">` : ""}

      <h3>${obj.title}</h3>
      <p><strong>Pris:</strong> ${obj.price.toLocaleString()} kr</p>
      <p><strong>Boarea:</strong> ${obj.area} kvm</p>
      ${obj.link ? `<a href="${obj.link}" target="_blank">Öppna annons</a>` : ""}
      <p><strong>Anteckningar:</strong> ${obj.notes}</p>

      <label class="compare-checkbox">
        <input type="checkbox" onchange="toggleCompare(${obj.id}, this.checked)"> Jämför
      </label>

      <button onclick="openEdit(${obj.id})">Redigera</button>
      <button onclick="deleteObject(${obj.id})">Ta bort</button>
    `;

    list.appendChild(card);
  });
}

/* ---------------- FAVORIT ---------------- */

function toggleFavorite(id) {
  const obj = objects.find(o => o.id === id);
  obj.favorite = !obj.favorite;
  save();
  renderList();
}

/* ---------------- JÄMFÖRELSE ---------------- */

function toggleCompare(id, checked) {
  if (checked) compareSelection.push(id);
  else compareSelection = compareSelection.filter(x => x !== id);

  if (compareSelection.length === 2) showComparison();
}

function showComparison() {
  compareContainer.innerHTML = "";
  compareSection.classList.remove("hidden");

  const items = objects.filter(o => compareSelection.includes(o.id));

  items.forEach(obj => {
    const card = document.createElement("div");
    card.className = "compare-card";

    card.innerHTML = `
      ${obj.image ? `<img src="${obj.image}" alt="Bild">` : ""}
      <h3>${obj.title}</h3>
      <p><strong>Pris:</strong> ${obj.price.toLocaleString()} kr</p>
      <p><strong>Boarea:</strong> ${obj.area} kvm</p>
      <p><strong>Pris/kvm:</strong> ${(obj.price / obj.area).toFixed(0)} kr</p>
      <p><strong>Anteckningar:</strong> ${obj.notes}</p>
    `;

    compareContainer.appendChild(card);
  });
}

closeCompareBtn.addEventListener("click", () => {
  compareSection.classList.add("hidden");
  compareSelection = [];
  renderList();
});

/* ---------------- RADERA ---------------- */

function deleteObject(id) {
  objects = objects.filter(obj => obj.id !== id);
  save();
  renderList();
}

/* ---------------- REDIGERA ---------------- */

function openEdit(id) {
  const obj = objects.find(o => o.id === id);
  editId = id;

  document.getElementById("edit-title").value = obj.title;
  document.getElementById("edit-price").value = obj.price;
  document.getElementById("edit-area").value = obj.area;
  document.getElementById("edit-link").value = obj.link;
  document.getElementById("edit-notes").value = obj.notes;

  editModal.classList.remove("hidden");
}

document.getElementById("cancel-edit").addEventListener("click", () => {
  editModal.classList.add("hidden");
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const obj = objects.find(o => o.id === editId);

  obj.title = document.getElementById("edit-title").value;
  obj.price = Number(document.getElementById("edit-price").value);
  obj.area = Number(document.getElementById("edit-area").value);
  obj.link = document.getElementById("edit-link").value;
  obj.notes = document.getElementById("edit-notes").value;

  const newImage = document.getElementById("edit-image").files[0];
  if (newImage) obj.image = await toBase64(newImage);

  save();
  renderList();
  editModal.classList.add("hidden");
});

/* ---------------- HJÄLPFUNKTION ---------------- */

function toBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
