const GameSession = require('../models/GameSession');


exports.saveGame = async (req, res) => {
    // Almacena los resultados de una partida terminada
    const { difficulty, mode, score, timeTaken } = req.body;
    const newSession = await GameSession.create({
        userId: req.user.id,
        difficulty,
        mode,
        score,
        timeTaken
    });
    res.status(201).json(newSession);
};

exports.getUserGames = async (req, res) => {
    // Obtiene los resultados de las partidas jugadas por un usuario
    const sessions = await GameSession.find({ userId: req.user.id });
    res.status(200).json(sessions);
};