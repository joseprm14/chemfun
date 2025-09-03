jest.mock('../../src/models/User', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(() => Promise.resolve('salt')),
  hash: jest.fn(async (pwd /*, saltOrRounds */) => `hashed:${pwd}`),
}));
jest.mock('../../src/utils/tokens', () => ({
  signAccessToken: jest.fn(() => 'access.jwt'),
  signRefreshToken: jest.fn(() => 'refresh.jwt'),
  verifyRefreshToken: jest.fn(),
  hashToken: jest.fn(() => 'hashed-refresh'),
  refreshCookieOptions: { httpOnly: true, sameSite: 'lax' },
}));


const User = require('../../src/models/User');
const bcrypt = require('bcrypt');
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  refreshCookieOptions,
} = require('../../src/utils/tokens');

const { loginUser , registerUser, refreshToken, logoutUser, getMe, updatePreferences } =
  require('../../src/controllers/userController');

const mockRes = () => {
  const res = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res); // <- necesario para logoutUser
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController (unit) - loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'access-it';
    process.env.JWT_REFRESH_SECRET = 'refresh-it';
  });

  test('OK devuelve token y setea cookie de refresh', async () => {
    const mockUserDoc = {
      _id: 'u1',
      username: 'alice',
      password: '$2b$10$fake-hash',
      refreshTokenHash: undefined,
      save: jest.fn(async function () { return this; }),
      toJSON: function () { return { _id: this._id, username: this.username }; },
    };
    User.findOne.mockResolvedValue(mockUserDoc);
    bcrypt.compare.mockResolvedValue(true); // contraseña OK

    const req = { body: { username: 'alice', password: 'Aa1!aaaa' } };
    const res = mockRes();

    await loginUser(req, res);

    // Efectos observables (no dependemos de qué función interna genera el token)
    expect(User.findOne).toHaveBeenCalledWith({ username: 'alice' });
    expect(bcrypt.compare).toHaveBeenCalledWith('Aa1!aaaa', mockUserDoc.password);

    // cookie httpOnly de refresh seteada
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.any(String),          // p.ej. 'refresh.jwt'
      expect.objectContaining({ httpOnly: true })
    );

    // respuesta con token y usuario
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: expect.any(String),
      user: expect.objectContaining({ id: 'u1', username: 'alice' }),
    });
    // se persistió el hash del refresh
    expect(mockUserDoc.refreshTokenHash).toBeDefined();
    expect(mockUserDoc.save).toHaveBeenCalled();
  });

  test('credenciales inválidas -> 401', async () => {
    const mockUserDoc = {
      _id: 'u1',
      username: 'alice',
      password: '$2b$10$fake-hash',
      save: jest.fn(),
    };
    User.findOne.mockResolvedValue(mockUserDoc);
    bcrypt.compare.mockResolvedValue(false); // <- contraseña incorrecta

    const req = { body: { username: 'alice', password: 'mal' } };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidos' });
    expect(res.cookie).not.toHaveBeenCalled();
    expect(mockUserDoc.save).not.toHaveBeenCalled();
  });

  test('usuario no existe -> 401', async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { username: 'nadie', password: 'Aa1!aaaa' } };
    const res = mockRes();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidos' });
  });
});

describe('userController (unit) - registerUser', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registerUser crea usuario y devuelve 201', async () => {
    const req = { body: { username: 'alice', password: 'secret123' } };
  const res = mockRes();

  // devuelve algo para que el controller no falle
  User.create.mockResolvedValue({ _id: '1', username: 'alice' });

  // hace match con el hash de arriba
  bcrypt.compare.mockImplementation(async (plain, hashed) => hashed === `hashed:${plain}`);

  await registerUser(req, res);

  // verifica qué se le pasó a create
  const [[payload]] = User.create.mock.calls;
  expect(payload.username).toBe('alice');
  await expect(bcrypt.compare('secret123', payload.password)).resolves.toBe(true);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({ message: 'Usuario creado correctamente' });
  });


  test('registerUser maneja duplicado con 400', async () => {
    const req = { body: { username: 'alice', password: 'x' } };
    const res = mockRes();
    User.create.mockRejectedValue(new Error('duplicate'));


    await registerUser(req, res);


      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nombre de usuario ya existe' });
  });
});


describe('userController (unit) - getMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devuelve datos públicos del usuario (200)', async () => {
    const req = { user: { id: 'u1' } };
    const res = mockRes();

    const userDoc = {
      _id: 'u1',
      username: 'alice',
      locale: 'es',
      theme: 'dark',
    };
    const selectGetMe = jest.fn().mockResolvedValue(userDoc);
    User.findById.mockReturnValue({ select: selectGetMe });

    await getMe(req, res);

    expect(User.findById).toHaveBeenCalledWith('u1');
    expect(selectGetMe).toHaveBeenCalledWith('_id username locale theme');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'u1',
      username: 'alice',
      locale: 'es',
      theme: 'dark',
    });
  });

  test('usuario no encontrado -> 404', async () => {
    const req = { user: { id: 'missing' } };
    const res = mockRes();

    const selectNotFound = jest.fn().mockResolvedValue(null);
    User.findById.mockReturnValue({ select: selectNotFound });

    await getMe(req, res);

    expect(User.findById).toHaveBeenCalledWith('missing');
    expect(selectNotFound).toHaveBeenCalledWith('_id username locale theme');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });
});

describe('userController (unit) - updatePreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('actualiza locale y/o theme y devuelve (200)', async () => {
    const req = { user: { id: 'u1' }, body: { locale: 'en', theme: 'light' } };
    const res = mockRes();

    const updatedDoc = {
      _id: 'u1',
      username: 'alice',
      locale: 'en',
      theme: 'light',
    };
    const selectUpdatePrefs = jest.fn().mockResolvedValue(updatedDoc);
    User.findByIdAndUpdate.mockReturnValue({ select: selectUpdatePrefs });

    await updatePreferences(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { locale: 'en', theme: 'light' },
      { new: true }
    );
    expect(selectUpdatePrefs).toHaveBeenCalledWith('_id username locale theme');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'u1',
      username: 'alice',
      locale: 'en',
      theme: 'light',
    });
  });

  test('si solo llega theme, no envía locale en el update', async () => {
    const req = { user: { id: 'u1' }, body: { theme: 'dark' } };
    const res = mockRes();

    const updatedDoc2 = {
      _id: 'u1',
      username: 'alice',
      locale: 'es',
      theme: 'dark',
    };
    const selectUpdatePrefs2 = jest.fn().mockResolvedValue(updatedDoc2);
    User.findByIdAndUpdate.mockReturnValue({ select: selectUpdatePrefs2 });

    await updatePreferences(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { theme: 'dark' },
      { new: true }
    );
    expect(selectUpdatePrefs2).toHaveBeenCalledWith('_id username locale theme');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'u1',
      username: 'alice',
      locale: 'es',
      theme: 'dark',
    });
  });

  test('usuario no encontrado -> 404', async () => {
    const req = { user: { id: 'u-missing' }, body: { locale: 'en' } };
    const res = mockRes();

    const selectNotFound = jest.fn().mockResolvedValue(null);
    User.findById.mockReturnValue({ select: selectNotFound });

    await getMe(req, res);

    expect(User.findById).toHaveBeenCalledWith('u-missing');
    expect(selectNotFound).toHaveBeenCalledWith('_id username locale theme');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });
});

describe('userController (unit) - logoutUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('con usuario autenticado: limpia refreshTokenHash, borra cookie y devuelve 200', async () => {
    const req = { user: { id: 'u1' } };
    const res = mockRes();

    User.findByIdAndUpdate.mockResolvedValue({}); // no usamos el resultado

    await logoutUser(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { $unset: { refreshTokenHash: 1 } }
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({ maxAge: 0 }) // no dependemos de todas las opciones internas
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sesión cerrada' });
  });

  test('sin usuario en req: no intenta tocar BD pero borra cookie y responde 200', async () => {
    const req = {}; // sin req.user
    const res = mockRes();

    await logoutUser(req, res);

    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({ maxAge: 0 })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sesión cerrada' });
  });
});