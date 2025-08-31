const GameSession = require('../models/GameSession');
const User = require('../models/User');

exports.getGlobalRanking = async (req, res) => {
    // Proporciona un ranking global para una modalidad y una dificultad de juego especifica
    const { mode, difficulty } = req.params;

    // Mediante consultas agregadas creamos un ranking con la puntuación máxima obtenida por cada usuario
    const rankingPoints = await GameSession.aggregate([
        { $match: { mode, difficulty } },
        { $sort: { score: -1, timeTaken: 1 } },
        {
        $group: {
            _id: "$userId",
            maxScore: { $max: "$score" },
            timeTaken: { $first: "$timeTaken" }
        }
        },
        {
        $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
        }
        },
        { $unwind: "$user" },
        { $sort: { maxScore: -1, timeTaken: 1 } },
        { $limit: 10 }
    ]);

    // También se obtiene el ranking por tiempo de partida
    const rankingTime = await GameSession.aggregate([
        { $match: { mode, difficulty } },
        { $sort: { timeTaken: 1, score: -1 } },
        {
        $group: {
            _id: "$userId",
            minTime: { $min: "$timeTaken" },
            score: { $first: "$score" }
        }
        },
        {
        $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user"
        }
        },
        { $unwind: "$user" },
        { $sort: { minTime: 1, score: -1 } },
        { $limit: 10 }
    ]);

    // Formatea los datos que se van a mostrar
    const formattedPoints = rankingPoints.map(r => ({
        username: r.user.username,
        score: r.maxScore,
        timeTaken: r.timeTaken
    }));
    const formattedTime = rankingTime.map(r => ({
        username: r.user.username,
        score: r.score,
        timeTaken: r.minTime
    }));

    res.status(200).json({byScore: formattedPoints, byTime: formattedTime});
};