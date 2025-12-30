// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const { initializePromise, db } = require('./database');
const carsController = require('./controllers/usersControllers');
const checkApiKey = require('./middleware/checkApiKey');

// Création de l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors()); // Autorise les requêtes cross-origin
app.use(express.json()); // Parse le JSON des requêtes

// Servir les fichiers statiques du dossier "public" (interface frontend)
app.use(express.static('public'));

// Route de bienvenue
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API de gestion de voitures classiques',
    version: '1.0.0',
    endpoints: {
      getAllCars: 'GET /api/cars',
      getCarById: 'GET /api/cars/:id',
      createCar: 'POST /api/cars',
      updateCar: 'PUT /api/cars/:id',
      deleteCar: 'DELETE /api/cars/:id',
    },
  });
});

// Routes CRUD protégées par le middleware
app.get('/api/cars', checkApiKey, carsController.getAllCars);
app.get('/api/cars/:id', checkApiKey, carsController.getCarById);
app.post('/api/cars', checkApiKey, carsController.createCar);
app.put('/api/cars/:id', checkApiKey, carsController.updateCar);
app.delete('/api/cars/:id', checkApiKey, carsController.deleteCar);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.url} n'existe pas`,
  });
});

// Données de test pour initialisation automatique
const sampleCars = [
  {
    brand: 'Ferrari',
    model: '250 GTO',
    year: 1962,
    color: 'Rouge',
    price: 45000000,
    mileage: 12000,
    description: 'Voiture de collection exceptionnelle',
  },
  {
    brand: 'Porsche',
    model: '911 Carrera RS',
    year: 1973,
    color: 'Blanc',
    price: 850000,
    mileage: 45000,
    description: 'Légendaire modèle RS',
  },
  {
    brand: 'Jaguar',
    model: 'E-Type',
    year: 1961,
    color: 'Bleu',
    price: 320000,
    mileage: 78000,
    description: 'Icône du design automobile',
  },
  {
    brand: 'Mercedes-Benz',
    model: '300 SL',
    year: 1955,
    color: 'Argent',
    price: 1200000,
    mileage: 34000,
    description: 'Portes papillon emblématiques',
  },
  {
    brand: 'Aston Martin',
    model: 'DB5',
    year: 1964,
    color: 'Gris',
    price: 750000,
    mileage: 56000,
    description: 'La voiture de James Bond',
  },
];

// Fonction pour initialiser la base avec des données de test si elle est vide
function seedIfEmpty() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM cars', (err, row) => {
      if (err) {
        console.error('❌  Erreur lors de la vérification de la base:', err.message);
        reject(err);
        return;
      }

      if (row.count === 0) {
        console.log('📦 Base de données vide, initialisation avec des données de test...');
        const insertQuery = `
          INSERT INTO cars (brand, model, year, color, price, mileage, description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        let insertedCount = 0;
        sampleCars.forEach((car) => {
          db.run(
            insertQuery,
            [
              car.brand,
              car.model,
              car.year,
              car.color,
              car.price,
              car.mileage,
              car.description,
            ],
            (insertErr) => {
              if (insertErr) {
                console.error('❌  Erreur lors de l\'insertion:', insertErr.message);
                reject(insertErr);
                return;
              }

              insertedCount += 1;
              if (insertedCount === sampleCars.length) {
                console.log(`✅  ${insertedCount} voitures insérées avec succès`);
                resolve();
              }
            },
          );
        });
      } else {
        console.log(`✅  Base de données contient déjà ${row.count} voiture(s)`);
        resolve();
      }
    });
  });
}

// Démarrage du serveur après initialisation de la base
initializePromise
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  Échec de l\'initialisation de la base de données:', err.message);
    process.exit(1);
  });