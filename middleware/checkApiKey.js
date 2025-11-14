const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = 'ma-super-cle-api-2024';

  if (!apiKey) {
    return res.status(401).json({
      error: 'Non autorisé',
      message: 'Clé API manquante. Ajoutez le header x-api-key à votre requête',
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Clé API invalide',
    });
  }

  console.log('✅  Clé API valide');
  next();
};

module.exports = checkApiKey;

