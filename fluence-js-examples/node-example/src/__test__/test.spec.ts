import { runServer } from '../main';
import { demoCalculation } from '../_aqua/demo-calculation';

describe('smoke test', () => {
    it('should work', async () => {
        await runServer();

        const res = await demoCalculation();

        expect(res).toBe(7);
    }, 10000);
});
