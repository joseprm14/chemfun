jest.mock('../../src/models/GameSession', () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

const GameSession = require('../../src/models/GameSession');
const { saveGame, getUserGames } = require('../../src/controllers/gameController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('gameController (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saveGame crea sesión de juego', async () => {
    const req = { user: { id: 'u1' }, body: { mode: 'click', difficulty: 'fácil', score: 10, timeTaken: 42 } };
    const res = mockRes();
    const session = { _id: 'g1', ...req.body, userId: 'u1' };
    GameSession.create.mockResolvedValue(session);

    await saveGame(req, res);

    expect(GameSession.create).toHaveBeenCalledWith({ userId: 'u1', ...req.body });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(session);
  });

  test('getUserGames devuelve partidas del usuario', async () => {
    const req = { user: { id: 'u1' } };
    const res = mockRes();
    const sessions = [{ _id: 'g1' }, { _id: 'g2' }];
    GameSession.find.mockResolvedValue(sessions);

    await getUserGames(req, res);

    expect(GameSession.find).toHaveBeenCalledWith({ userId: 'u1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(sessions);
  });
});
