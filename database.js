const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers le fichier de base de données
const dbPath = path.resolve(__dirname, 'cars.db');

// Création/ouverture de la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌  Erreur de connexion à la base de données:', err.message);
  } else {
    console.log('✅  Connecté à la base de données SQLite');
  }
});

// Création de la table cars si elle n'existe pas
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT,
    price REAL,
    mileage INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

const initializePromise = new Promise((resolve, reject) => {
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('❌  Erreur lors de la création de la table:', err.message);
      reject(err);
    } else {
      console.log('✅  Table cars créée ou déjà existante');
      resolve();
    }
  });
});

module.exports = {
  db,
  initializePromise,
};

