jest.mock('../../src/models/GameSession', () => ({ aggregate: jest.fn() }));
const GameSession = require('../../src/models/GameSession');
const { getGlobalRanking } = require('../../src/controllers/rankingController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json  = jest.fn().mockReturnValue(res);
  return res;
};

describe('rankingController (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('test-b-u-07 - formatea ranking por puntuación y tiempo', async () => {
    const req = { params: { mode: 'click', difficulty: 'fácil' } };
    const res = mockRes();

    // Primera llamada -> byScore; segunda -> byTime
    GameSession.aggregate
      .mockResolvedValueOnce([
        { _id: 'u1', maxScore: 12, timeTaken: 30, user: { username: 'alice' } },
        { _id: 'u2', maxScore: 10, timeTaken: 20, user: { username: 'bob' } },
      ])
      .mockResolvedValueOnce([
        { _id: 'u2', minTime: 18, score: 9, user: { username: 'bob' } },
        { _id: 'u1', minTime: 21, score: 12, user: { username: 'alice' } },
      ]);

    await getGlobalRanking(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      byScore: [
        { username: 'alice', score: 12, timeTaken: 30 },
        { username: 'bob',   score: 10, timeTaken: 20 },
      ],
      byTime: [
        { username: 'bob',   score: 9,  timeTaken: 18 },
        { username: 'alice', score: 12, timeTaken: 21 },
      ],
    });
  });
});
