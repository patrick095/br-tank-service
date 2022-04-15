import { UserInvalidException } from './user.exceptions';

describe('User', () => {
    it('should be defined', () => {
        expect(new UserInvalidException()).toBeDefined();
    });
});
