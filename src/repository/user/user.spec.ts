import { Users } from './user.entiry';

describe('User', () => {
    it('should be defined', () => {
        expect(new Users()).toBeDefined();
    });
});
