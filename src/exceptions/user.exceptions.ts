import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
    constructor() {
        super('User not found!', HttpStatus.NOT_FOUND);
    }
}

export class UserInvalidException extends HttpException {
    constructor() {
        super('Invalid username or password!', HttpStatus.UNAUTHORIZED);
    }
}

export class UserRegisteredException extends HttpException {
    constructor() {
        super('User already exists!', HttpStatus.BAD_REQUEST);
    }
}
