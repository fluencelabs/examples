import { main } from '../main';

describe('smoke test', () => {
    it('should work', async () => {
        console.log = jest.fn();

        await main();

        expect(console.log).toBeCalledTimes(6);
        expect(console.log).toHaveBeenNthCalledWith(2, expect.stringMatching('echo result'), 'Jim,John,Jake,');
        expect(console.log).toHaveBeenNthCalledWith(3, expect.stringMatching('greeting result'), 'Hi, Jim');
        expect(console.log).toHaveBeenNthCalledWith(4, expect.stringMatching('seq result'), [
            'Hi, Jim',
            'Hi, John',
            'Hi, Jake',
        ]);
        expect(console.log).toHaveBeenNthCalledWith(5, expect.stringMatching('par result'), [
            'Hi, Jim',
            'Hi, Jim',
            'Hi, John',
            'Hi, John',
            'Hi, Jake',
            'Hi, Jake',
        ]);
        expect(console.log).toHaveBeenNthCalledWith(6, expect.stringMatching('par improved signature result'), [
            'Hi, Jim',
            'Bye, Jim',
            'Hi, John',
            'Bye, John',
            'Hi, Jake',
            'Bye, Jake',
        ]);
    });
});
