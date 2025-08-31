import nextJest from 'next/jest';


const createJestConfig = nextJest({
    dir: './',
});


const config = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/src/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    },
    testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
    transform: {},
    clearMocks: true,
};


export default createJestConfig(config);