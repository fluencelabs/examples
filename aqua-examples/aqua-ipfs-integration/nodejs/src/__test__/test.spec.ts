import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { main } from '../main';

describe('smoke test', () => {
    it('should work', async () => {
        console.log = jest.fn();

        await main(krasnodar);

        expect(console.log).toBeCalledTimes(16);
        expect(console.log).toHaveBeenNthCalledWith(
            13,
            '📗 uploaded file:',
            expect.objectContaining({
                path: 'NZgK6DB.png',
                size: expect.any(Number),
                cid: expect.anything(),
            }),
        );
        expect(console.log).toHaveBeenNthCalledWith(
            15,
            '📗 File size is saved to IPFS:',
            expect.objectContaining({
                error: '',
                hash: expect.any(String),
                success: true,
            }),
        );
    }, 20000);
});
