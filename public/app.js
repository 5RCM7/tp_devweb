/**
 * ============================================
 * APP.JS - Page principale de gestion des voitures
 * ============================================
 * 
 * Ce fichier gère l'affichage de la liste des voitures, l'ajout
 * et la suppression de voitures via l'API REST.
 * 
 * Technologies utilisées :
 * - Fetch API pour communiquer avec le backend
 * - Manipulation du DOM pour créer dynamiquement le contenu
 * - async/await pour gérer les requêtes asynchrones
 * - Bootstrap 5 pour le design responsive
 */

// ========== CONFIGURATION ==========

/**
 * URL de base de l'API (relative pour fonctionner en local ET sur Render)
 */
const API_BASE_URL = '/api/cars';

/**
 * Clé API nécessaire pour authentifier les requêtes
 */
const API_KEY = 'ma-super-cle-api-2024';

// ========== SÉLECTEURS DOM ==========

/**
 * Éléments du DOM utilisés dans cette page
 */
const carsTbody = document.getElementById('cars-tbody');
const alertContainer = document.getElementById('alert-container');
const carForm = document.getElementById('car-form');
const refreshBtn = document.getElementById('refresh-btn');

// ========== FONCTIONS UTILITAIRES UI ==========

/**
 * Affiche une alerte Bootstrap sur la page
 * @param {string} message - Message à afficher
 * @param {string} type - Type d'alerte ('success', 'danger', 'warning', 'info')
 * @param {number} duration - Durée d'affichage en ms (0 = permanent)
 */
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

/**
 * Formate un nombre avec des séparateurs de milliers (format français)
 * @param {number|string|null} value - Valeur à formater
 * @returns {string} Nombre formaté ou '-' si valeur vide
 */
function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '-';
  return new Intl.NumberFormat('fr-FR').format(Number(value));
}

// ========== REQUÊTES API ==========

/**
 * Fonction générique pour effectuer des requêtes API avec authentification
 * @param {string} url - URL de la requête
 * @param {Object} options - Options de la requête (method, body, etc.)
 * @returns {Promise<Object>} Données JSON de la réponse
 * @throws {Error} Si la requête échoue
 */
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

  // Vérifier le type de contenu de la réponse
  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  // Gérer les erreurs HTTP
  if (!response.ok) {
    const errorMessage =
      (data && (data.message || data.error)) ||
      `Erreur HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Récupère toutes les voitures depuis l'API
 * @returns {Promise<Array>} Tableau des voitures
 */
async function fetchCars() {
  const data = await apiFetch(API_BASE_URL);
  return data.data || [];
}

/**
 * Crée une nouvelle voiture via l'API
 * @param {Object} car - Objet voiture à créer
 * @returns {Promise<Object>} Voiture créée avec son ID
 */
async function createCar(car) {
  const data = await apiFetch(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(car),
  });
  return data.data;
}

/**
 * Supprime une voiture par son ID
 * @param {number|string} id - ID de la voiture à supprimer
 * @returns {Promise<void>}
 */
async function deleteCar(id) {
  await apiFetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}

// ========== MANIPULATION DU DOM ==========

/**
 * Crée une ligne de tableau (tr) pour une voiture
 * @param {Object} car - Objet voiture avec toutes ses propriétés
 * @returns {HTMLTableRowElement} Élément tr créé
 */
function createCarRow(car) {
  const tr = document.createElement('tr');
  tr.dataset.id = car.id;

  tr.innerHTML = `
    <td>${car.id}</td>
    <td><a href="car.html?id=${car.id}" class="text-decoration-none">${car.brand}</a></td>
    <td><a href="car.html?id=${car.id}" class="text-decoration-none">${car.model}</a></td>
    <td>${car.year}</td>
    <td>${car.color || '-'}</td>
    <td>${car.price != null ? formatNumber(car.price) + ' €' : '-'}</td>
    <td>${car.mileage != null ? formatNumber(car.mileage) + ' km' : '-'}</td>
    <td>${car.description || '-'}</td>
    <td>
      <div class="btn-group" role="group">
        <a href="car.html?id=${car.id}" class="btn btn-sm btn-outline-primary">Voir</a>
        <button class="btn btn-sm btn-outline-danger btn-delete">
          Supprimer
        </button>
      </div>
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

/**
 * Affiche la liste des voitures dans le tableau
 * @param {Array} cars - Tableau des voitures à afficher
 */
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

// ========== GESTION DES ÉVÉNEMENTS ==========

/**
 * Gère le rafraîchissement de la liste des voitures
 */
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

/**
 * Récupère et formate les données du formulaire
 * @returns {Object} Objet voiture avec les données formatées
 */
function getCarFormData() {
  const formData = new FormData(carForm);
  const car = Object.fromEntries(formData.entries());

  // Conversions numériques pour les champs numériques
  if (car.year) car.year = Number(car.year);
  if (car.price) car.price = Number(car.price);
  if (car.mileage) car.mileage = Number(car.mileage);

  // Champs optionnels vides => null (pour la base de données)
  ['color', 'price', 'mileage', 'description'].forEach((key) => {
    if (car[key] === '') {
      car[key] = null;
    }
  });

  return car;
}

/**
 * Gère la soumission du formulaire d'ajout de voiture
 * @param {Event} event - Événement de soumission du formulaire
 */
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

/**
 * Initialise tous les écouteurs d'événements
 */
function initEventListeners() {
  refreshBtn.addEventListener('click', handleRefresh);
  carForm.addEventListener('submit', handleFormSubmit);
}

// ========== INITIALISATION ==========

/**
 * Initialise la page lorsque le DOM est chargé
 */
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  handleRefresh(); // Charger les voitures au démarrage
});


