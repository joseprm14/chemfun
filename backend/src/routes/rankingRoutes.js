const express = require('express');
const { getGlobalRanking } = require('../controllers/rankingController');

// TODO middleware especifico para validar parametros de rutas?

const router = express.Router();
router.get('/:mode/:difficulty', getGlobalRanking);

module.exports = router;