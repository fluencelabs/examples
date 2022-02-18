import handler from 'serve-handler';
import http from 'http';
import path from 'path';

const port = 3000;
const uri = `http://localhost:${port}/`
const publicPath = path.join(__dirname, '../../build/');

console.log(publicPath);

const server = http.createServer((request, response) => {
    return handler(request, response, {
        public: publicPath
  });
})

const startServer = async () => {
    return new Promise((resolve: any) => {
        server.listen(port, resolve);
    })
}

const stopServer = async () => {
    return new Promise((resolve: any) => {
        server.close(resolve);
    })
}


describe('smoke test', () => {
    beforeAll(startServer);

    afterAll(stopServer);

    it('should work', async () => {
        console.log('going to the page in browser...');
        await page.goto(uri);

        console.log('waiting for fluence to connect...');
        await page.waitForTimeout(1000);

        console.log('clicking button...');
        await page.click('#btn');

        console.log('waiting for price to appear...');
        const elem = await page.waitForSelector('#price');

        console.log('getting the content of price div...');
        const content = await elem?.evaluate((x) => x.textContent);

        expect(content).toMatch("The price is:")
    }, 10000);
});
