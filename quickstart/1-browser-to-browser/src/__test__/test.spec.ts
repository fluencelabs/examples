import { Page } from 'puppeteer';

const peerIdLength = '12D3KooWM2CYSHefG6KPKbYFAgsbPh8p6b8HYHc6VNkge2rPtYv5'.length;

const loadApp = async (page: Page) => {
    console.log('opening page...');
    await page.goto('http://localhost:3000/');

    console.log('clicking connect button...');
    await page.click('.btn');

    console.log('waiting for fluence to connect...');
    await page.waitForTimeout(1000);

    console.log('waiting for "say hello" button to appear...');
    await page.waitForSelector('.btn-hello');

    console.log('getting self peer id and relay...');
    const peerId = await page.$eval('#peerId', (x) => x.textContent);
    const relayId = await page.$eval('#relayId', (x) => x.textContent);

    expect(peerId?.length).toBe(peerIdLength);
    expect(relayId?.length).toBe(peerIdLength);

    return {
        peerId,
        relayId,
    };
};

const waitForSelectorAndGetText = async (page: Page, selector: string) => {
    const page1Message = await page.waitForSelector('#message');
    return await page1Message?.evaluate((x) => x.textContent?.trim().replace('\n', ''));
};

describe('smoke test', () => {
    it('should work', async () => {
        const page1 = await browser.newPage();
        const page2 = await browser.newPage();

        console.log('=== browser 1 ===');
        const peerRelay1 = await loadApp(page1);

        console.log('=== browser 2 ===');
        const peerRelay2 = await loadApp(page2);

        console.log('=== browser 1 ===');

        console.log('filling form...');
        await page1.focus('#targetPeerId');
        await page1.keyboard.type(peerRelay2.peerId!);

        await page1.focus('#targetRelayId');
        await page1.keyboard.type(peerRelay2.relayId!);

        console.log('clicking "say hello"...');
        await page1.click('.btn-hello');

        console.log('waiting for particle to execute...');
        await page1.waitForTimeout(1000);

        console.log('=== finale ===');

        console.log('getting message from page1...');
        const page1Message = await waitForSelectorAndGetText(page1, '#message');

        console.log('getting message from page2...');
        const page2Message = await waitForSelectorAndGetText(page2, '#message');

        expect(page1Message).toBe('Hello back to you, ' + peerRelay1.peerId);
        expect(page2Message).toBe('Hello from: ' + peerRelay1.peerId);
    }, 10000);
});
