import { justStop, runServer } from '../main';
import { demoCalculation } from '../_aqua/demo-calculation';

describe('smoke test', () => {
    it('should work', async () => {
        try {
            await runServer();

            const res = await demoCalculation();

            expect(res).toBe(7);
        } finally {
            await justStop();
        }
    }, 15000);
});
