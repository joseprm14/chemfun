const express = require('express');
const auth = require('../middleware/authMiddleware.js');
const { saveGame, getUserGames } = require('../controllers/gameController.js');
const validate = require('../middleware/validationMiddleware.js');
const { gameSessionSchema } = require('../validators/schemas.js');

const router = express.Router();

router.post('/save', auth, validate(gameSessionSchema), saveGame);
router.get('/mygames', auth, getUserGames);

module.exports = router;