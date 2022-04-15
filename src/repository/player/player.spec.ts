import { Player } from './player.entity';

describe('Player', () => {
    it('should be defined', () => {
        expect(new Player()).toBeDefined();
    });
});
