import { ObjectID } from 'typeorm';

export interface playerInterface {
    _id?: ObjectID;
    name: string;
    position: positionInterface;
    team: number;
    color: string;
    hp: number;
}

export interface positionInterface {
    x: number;
    y: number;
}

export interface GunShootInterface {
    playerPosition: positionInterface;
    enemyPosition: positionInterface;
    angle: number;
    power: number;
    id: string;
    enemyId: string;
}
