const express = require('express');
const { getGlobalRanking } = require('../controllers/rankingController');

// Ruta para la función de rankingController
const router = express.Router();
router.get('/:mode/:difficulty', getGlobalRanking);

module.exports = router;