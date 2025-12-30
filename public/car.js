/**
 * ============================================
 * CAR.JS - Page de détail d'une voiture
 * ============================================
 * 
 * Ce fichier gère l'affichage des détails d'une voiture spécifique
 * en utilisant les paramètres d'URL (URL Parameters).
 * 
 * Exemple d'URL : car.html?id=1
 * 
 * Technologies utilisées :
 * - Fetch API pour récupérer les données
 * - URLSearchParams pour lire les paramètres d'URL
 * - Manipulation du DOM pour afficher les données
 * - async/await pour gérer les requêtes asynchrones
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
const alertContainer = document.getElementById('alert-container');
const loadingSection = document.getElementById('loading-section');
const carDetailsSection = document.getElementById('car-details-section');
const errorSection = document.getElementById('error-section');
const deleteBtn = document.getElementById('delete-btn');

// Éléments pour afficher les détails
const carId = document.getElementById('car-id');
const carTitle = document.getElementById('car-title');
const carBrand = document.getElementById('car-brand');
const carModel = document.getElementById('car-model');
const carYear = document.getElementById('car-year');
const carColor = document.getElementById('car-color');
const carPrice = document.getElementById('car-price');
const carMileage = document.getElementById('car-mileage');
const carDescription = document.getElementById('car-description');
const carCreated = document.getElementById('car-created');

// ========== FONCTIONS UTILITAIRES ==========

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

/**
 * Formate une date au format français
 * @param {string} dateString - Date au format ISO
 * @returns {string} Date formatée ou '-' si vide
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
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
 * Récupère les détails d'une voiture par son ID
 * @param {number|string} id - ID de la voiture
 * @returns {Promise<Object>} Objet voiture avec toutes ses propriétés
 */
async function fetchCarById(id) {
  const data = await apiFetch(`${API_BASE_URL}/${id}`);
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

// ========== GESTION DE L'AFFICHAGE ==========

/**
 * Affiche les détails de la voiture dans le DOM
 * @param {Object} car - Objet voiture avec toutes ses propriétés
 */
function displayCarDetails(car) {
  // Titre de la page
  carTitle.textContent = `${car.brand} ${car.model} (${car.year})`;

  // Informations générales
  carId.textContent = car.id;
  carBrand.textContent = car.brand || '-';
  carModel.textContent = car.model || '-';
  carYear.textContent = car.year || '-';
  carColor.textContent = car.color || '-';

  // Caractéristiques
  carPrice.textContent = car.price != null ? `${formatNumber(car.price)} €` : '-';
  carMileage.textContent = car.mileage != null ? `${formatNumber(car.mileage)} km` : '-';
  carCreated.textContent = formatDate(car.created_at);

  // Description
  carDescription.textContent = car.description || 'Aucune description disponible.';

  // Afficher la section de détails
  loadingSection.classList.add('d-none');
  carDetailsSection.classList.remove('d-none');
}

/**
 * Affiche un message d'erreur
 * @param {string} message - Message d'erreur à afficher
 */
function displayError(message) {
  const errorMessageEl = document.getElementById('error-message');
  errorMessageEl.textContent = message;

  loadingSection.classList.add('d-none');
  errorSection.classList.remove('d-none');
}

// ========== GESTION DES ÉVÉNEMENTS ==========

/**
 * Gère le chargement initial de la page
 * Récupère l'ID depuis les paramètres d'URL et charge les détails
 */
async function handlePageLoad() {
  // Récupérer l'ID depuis les paramètres d'URL
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get('id');

  // Vérifier que l'ID est présent
  if (!carId) {
    displayError("ID de voiture manquant dans l'URL. Format attendu : car.html?id=1");
    return;
  }

  // Vérifier que l'ID est un nombre valide
  if (isNaN(carId) || parseInt(carId) <= 0) {
    displayError("ID de voiture invalide. L'ID doit être un nombre positif.");
    return;
  }

  try {
    // Récupérer les détails de la voiture
    const car = await fetchCarById(carId);
    displayCarDetails(car);

    // Configurer le bouton de suppression
    deleteBtn.addEventListener('click', () => handleDelete(car.id));
  } catch (error) {
    console.error('Erreur lors du chargement des détails:', error);
    displayError(`Erreur lors du chargement : ${error.message}`);
  }
}

/**
 * Gère la suppression d'une voiture
 * @param {number|string} id - ID de la voiture à supprimer
 */
async function handleDelete(id) {
  const confirmDelete = window.confirm(
    `Êtes-vous sûr de vouloir supprimer cette voiture ? Cette action est irréversible.`,
  );

  if (!confirmDelete) return;

  try {
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Suppression...';

    await deleteCar(id);

    showAlert('Voiture supprimée avec succès. Redirection...', 'success', 2000);

    // Rediriger vers la liste après 2 secondes
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    showAlert(`Erreur lors de la suppression : ${error.message}`, 'danger');
    deleteBtn.disabled = false;
    deleteBtn.textContent = 'Supprimer cette voiture';
  }
}

// ========== INITIALISATION ==========

/**
 * Initialise la page lorsque le DOM est chargé
 */
document.addEventListener('DOMContentLoaded', () => {
  handlePageLoad();
});

