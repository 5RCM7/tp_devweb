// Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const { initializePromise } = require('./database');
const carsController = require('./controllers/usersControllers');
const checkApiKey = require('./middleware/checkApiKey');

// Création de l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(cors()); // Autorise les requêtes cross-origin
app.use(express.json()); // Parse le JSON des requêtes

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

// Démarrage du serveur après initialisation de la base
initializePromise
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  Échec de l’initialisation de la base de données:', err.message);
    process.exit(1);
  });