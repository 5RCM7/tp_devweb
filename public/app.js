// Configuration de base
// URL relative pour fonctionner en local ET sur Render (même domaine)
const API_BASE_URL = '/api/cars';
const API_KEY = 'ma-super-cle-api-2024';

// Sélecteurs DOM
const carsTbody = document.getElementById('cars-tbody');
const alertContainer = document.getElementById('alert-container');
const carForm = document.getElementById('car-form');
const refreshBtn = document.getElementById('refresh-btn');

// ----------- Helpers UI -----------

function showAlert(message, type = 'info', duration = 4000) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>
    </div>
  `;
  alertContainer.appendChild(wrapper);

  if (duration) {
    setTimeout(() => {
      wrapper.remove();
    }, duration);
  }
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '-';
  return new Intl.NumberFormat('fr-FR').format(Number(value));
}

// ----------- Requêtes API -----------

async function apiFetch(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage =
      (data && (data.message || data.error)) ||
      `Erreur HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

async function fetchCars() {
  const data = await apiFetch(API_BASE_URL);
  return data.data || [];
}

async function createCar(car) {
  const data = await apiFetch(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(car),
  });
  return data.data;
}

async function deleteCar(id) {
  await apiFetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}

// ----------- Rendu DOM -----------

function createCarRow(car) {
  const tr = document.createElement('tr');
  tr.dataset.id = car.id;

  tr.innerHTML = `
    <td>${car.id}</td>
    <td>${car.brand}</td>
    <td>${car.model}</td>
    <td>${car.year}</td>
    <td>${car.color || '-'}</td>
    <td>${car.price != null ? formatNumber(car.price) + ' €' : '-'}</td>
    <td>${car.mileage != null ? formatNumber(car.mileage) + ' km' : '-'}</td>
    <td>${car.description || '-'}</td>
    <td>
      <button class="btn btn-sm btn-outline-danger btn-delete">
        Supprimer
      </button>
    </td>
  `;

  const deleteBtn = tr.querySelector('.btn-delete');
  deleteBtn.addEventListener('click', async () => {
    const confirmDelete = window.confirm(
      `Supprimer la voiture #${car.id} (${car.brand} ${car.model}) ?`,
    );
    if (!confirmDelete) return;

    try {
      await deleteCar(car.id);
      tr.remove();
      showAlert('Voiture supprimée avec succès.', 'success');
    } catch (error) {
      showAlert(`Erreur lors de la suppression : ${error.message}`, 'danger');
    }
  });

  return tr;
}

function renderCars(cars) {
  carsTbody.innerHTML = '';
  if (!cars.length) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td colspan="9" class="text-center text-muted py-3">Aucune voiture trouvée.</td>';
    carsTbody.appendChild(tr);
    return;
  }

  cars.forEach((car) => {
    const row = createCarRow(car);
    carsTbody.appendChild(row);
  });
}

// ----------- Gestion des événements -----------

async function handleRefresh() {
  try {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Chargement...';
    const cars = await fetchCars();
    renderCars(cars);
  } catch (error) {
    showAlert(`Erreur lors du chargement des voitures : ${error.message}`, 'danger');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Rafraîchir';
  }
}

function getCarFormData() {
  const formData = new FormData(carForm);
  const car = Object.fromEntries(formData.entries());

  // Conversions numériques simples
  if (car.year) car.year = Number(car.year);
  if (car.price) car.price = Number(car.price);
  if (car.mileage) car.mileage = Number(car.mileage);

  // Champs optionnels vides => null
  ['color', 'price', 'mileage', 'description'].forEach((key) => {
    if (car[key] === '') {
      car[key] = null;
    }
  });

  return car;
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const submitBtn = carForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Ajout...';

  try {
    const car = getCarFormData();
    const created = await createCar(car);

    // Ajouter la nouvelle voiture au début du tableau
    const newRow = createCarRow(created);
    carsTbody.prepend(newRow);

    carForm.reset();
    showAlert('Voiture ajoutée avec succès.', 'success');
  } catch (error) {
    showAlert(`Erreur lors de l’ajout : ${error.message}`, 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ajouter';
  }
}

function initEventListeners() {
  refreshBtn.addEventListener('click', handleRefresh);
  carForm.addEventListener('submit', handleFormSubmit);
}

// ----------- Initialisation -----------

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  handleRefresh();
});


