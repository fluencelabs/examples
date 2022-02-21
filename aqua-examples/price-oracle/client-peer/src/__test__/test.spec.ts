import { main } from '../main';

describe('smoke test', () => {
    it('should work', async () => {
        console.log = jest.fn();

        await main();

        expect(console.log).toBeCalledTimes(4);
        expect(console.log).toHaveBeenNthCalledWith(3, 'seq result: ', {
            error_msg: '',
            result: expect.any(Number),
            success: true,
        });
        expect(console.log).toHaveBeenNthCalledWith(4, 'par result: ', {
            error_msg: '',
            result: expect.any(Number),
            success: true,
        });
    }, 10000);
});
