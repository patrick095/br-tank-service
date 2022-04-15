import { ObjectID } from 'typeorm';
import { playerInterface } from './player.interface';

export interface gameInterface {
    _id: ObjectID;
    wind: windInterface;
    players: Array<playerInterface>;
    playerTurn: string;
    turn: number;
    winner: string;
    countdown: number;
}

export interface windInterface {
    speed: number;
    angle: number;
}
