import { main } from '../main';

describe('smoke test', () => {
    it('should work', async () => {
        console.log = jest.fn();

        await main();

        expect(console.log).toBeCalledTimes(3);
        expect(console.log).toHaveBeenNthCalledWith(1, 'Hello, world!');
        expect(console.log).toHaveBeenNthCalledWith(2, 'Wealth awaits you very soon.');
        expect(console.log).toHaveBeenNthCalledWith(3, 'The relay time is: ', expect.anything());
    }, 15000);
});
