module.exports = {
    preset: 'jest-puppeteer',
    testMatch: ['**/?(*.)+(spec|test).[t]s'],
    testPathIgnorePatterns: ['/node_modules/', 'dist'],
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
};
