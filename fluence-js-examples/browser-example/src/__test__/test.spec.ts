describe('smoke test', () => {
    it('should work', async () => {
        console.log('going to the page in browser...');
        await page.goto('http://localhost:3000/');

        console.log('waiting for fluence to connect...');
        await page.waitForTimeout(1000);

        console.log('clicking button...');
        await page.click('#btn');

        console.log('waiting for relay time to appear...');
        const elem = await page.waitForSelector('#relayTime');

        console.log('getting the content of relay time div...');
        const content = await elem?.evaluate((x) => x.textContent);

        expect(content?.length).toBeGreaterThan(10);
    }, 10000);
});
