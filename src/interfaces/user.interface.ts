import { ObjectID } from 'typeorm';

export interface userSigninInterface {
    username: string;
    password: string;
}

export interface userInterface {
    _id?: ObjectID;
    username: string;
    name: string;
    password: string;
    email: string;
    playerId?: string;
}

export interface findUserInterface {
    username?: string;
    id?: string;
    email?: string;
    password: string;
}
