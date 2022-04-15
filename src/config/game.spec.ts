import { GameConfig } from './game.config';

describe('Game', () => {
    it('should be defined', () => {
        expect(new GameConfig()).toBeDefined();
    });
});
