import handler from 'serve-handler';
import http from 'http';
import path from 'path';

const port = 3001;
const uri = `http://localhost:${port}/`;
const publicPath = path.join(__dirname, '../../build/');

console.log(publicPath);

const server = http.createServer((request, response) => {
    return handler(request, response, {
        public: publicPath,
    });
});

const startServer = async () => {
    return new Promise((resolve: any) => {
        server.listen(port, resolve);
    });
};

const stopServer = async () => {
    return new Promise((resolve: any) => {
        server.close(resolve);
    });
};

describe('smoke test', () => {
    beforeAll(startServer);

    afterAll(stopServer);

    it('should work', async () => {
        console.log('going to the page in browser...');
        await page.goto(uri);

        console.log('clicking connect button...');
        await page.click('.btn-connect');

        console.log('waiting for fluence to connect...');
        await page.waitForTimeout(1000);

        console.log('waiting for "deploy service" button to appear...');
        await page.waitForSelector('#deploy-service');

        console.log('clicking "deploy service" button...');
        await page.click('#deploy-service');

        console.log('waiting for "get size" button to appear...');
        await page.waitForSelector('#get-size');

        console.log('clicking "get size" button...');
        await page.click('#get-size');

        console.log('waiting for result to appear...');
        const sizeEl = await page.waitForSelector('#file-size');

        const size = await sizeEl?.evaluate((x) => x.textContent);

        expect(size).toBe('144804');
    }, 15000);
});
