/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    setupFilesAfterEnv: [],
    // Aumenta el timeout para pruebas con Mongo Memory Server
    testTimeout: 30000,
    // Limpieza de mocks entre tests
    clearMocks: true,
    restoreMocks: true,
};