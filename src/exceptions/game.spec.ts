import { Game } from './game.exceptions';

describe('Game', () => {
    it('should be defined', () => {
        expect(new Game()).toBeDefined();
    });
});
