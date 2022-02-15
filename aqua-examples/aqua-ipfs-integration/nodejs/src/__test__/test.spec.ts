import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { main } from '../main';

describe('smoke test', () => {
    it('should work', async () => {
        console.log = jest.fn();

        await main(krasnodar);

        expect(console.log).toBeCalledTimes(0);
        // TODO::
    });
});
