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

export interface roomInterface {
    id: number;
    players: Array<string>;
    map?: string;
    status: 'waiting' | 'playing' | 'finished';
}

export interface onlinePlayersInterface {
    userId: string;
    name: string;
    socketId: string;
}
