import { ServerConfig } from './server.config';

describe('Server', () => {
    it('should be defined', () => {
        expect(new ServerConfig()).toBeDefined();
    });
});
