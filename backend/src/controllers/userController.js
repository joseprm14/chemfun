const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Cookies de refresh
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // requiere HTTPS en prod
  sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
  path: '/', // así podemos borrarla fácilmente en logout
  // 7 días por defecto
  maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.registerUser = async (req, res) => {
    // Registra un nuevo usuario en la base de datos
    const { username, password, locale, theme } = req.body;
    try {
        // Se encripta la contraseña para almacenarla de forma segura
        const hash = await bcrypt.hash(password, saltRounds);
        const user = await User.create({ username, password: hash, locale, theme });
        res.status(201).json({ message: 'Usuario creado correctamente' });
    } catch (err) {
        res.status(400).json({ error: 'Nombre de usuario ya existe' });
    }
};

exports.loginUser = async (req, res) => {
    // Inicia sesión para un usuario existente, devolviendo un token de autenticación
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidos' });

    const valid = await bcrypt.compare(password, user.password); // Comprueba la contraseña
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidos' });

    // Tokens de acceso y de refresco
    const accessToken = signAccessToken({ id: user._id });
    const refreshToken = signRefreshToken({ id: user._id, jti: crypto.randomUUID() });

    // Se hashea el token de refresco para guardarlo en base de datos
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    res.status(200).json({
        token: accessToken,
        user: {
            id: user._id,
            username: user.username,
            locale: user.locale,
            theme: user.theme
        }
    });
};

exports.refreshToken = async (req, res) => {
    // Para refrescar el token de acceso
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token requerido' });

    try {
        const payload = verifyRefreshToken(token);
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

        if (user.refreshTokenHash !== hashToken(token)) {
        return res.status(401).json({ error: 'Refresh token inválido' });
        }

        // Rotación del refresh token
        const newAccess = signAccessToken({ id: user._id });
        const newRefresh = signRefreshToken({ id: user._id, jti: crypto.randomUUID() });

            user.refreshTokenHash = hashToken(newRefresh);
        await user.save();

        res.cookie('refreshToken', newRefresh, refreshCookieOptions);
        res.status(200).json({ token: newAccess });
    } catch (err) {
        const isExpired = err && err.name === 'TokenExpiredError';
        res.status(401).json({ error: isExpired ? 'Refresh token expirado' : 'Refresh token inválido' });
    }
};

exports.logoutUser = async (req, res) => {
    // Funcion para cerrar sesion
    try {
        if (req.user?.id) {
            await User.findByIdAndUpdate(req.user.id, { $unset: { refreshTokenHash: 1 } });
        }
    } catch (_) {}
    res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: 0 });
    res.status(200).json({ message: 'Sesión cerrada' });
};

exports.getMe = async (req, res) => {
    // Funcion para obtener las preferencias de un usuario
    const user = await User.findById(req.user.id).select('_id username locale theme');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json({
        id: user._id,
        username: user.username,
        locale: user.locale,
        theme: user.theme
    });
};

exports.updatePreferences = async (req, res) => {
    // Funcion para actualizar las preferencias de un usuario
    const { locale, theme } = req.body;
    const updated = await User.findByIdAndUpdate(
        req.user.id,
        { ...(locale && { locale }), ...(theme && { theme }) },
        { new: true }
    ).select('_id username locale theme');
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json({
        id: updated._id,
        username: updated.username,
        locale: updated.locale,
        theme: updated.theme
    });
};
