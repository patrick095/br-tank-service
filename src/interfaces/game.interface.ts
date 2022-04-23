import { Player } from 'src/repository/player/player.entity';
import { ObjectID } from 'typeorm';
import { positionInterface } from './player.interface';

export interface gameInterface {
    _id?: ObjectID;
    wind: windInterface;
    players: Array<string>;
    playerTurn: string;
    turn: number;
    winner: Player;
    countdown: number;
    status: 'playning' | 'finished';
}

export interface windInterface {
    speed: number;
    angle: number;
}

export interface ShootInterface {
    playerPosition: positionInterface;
    enemyPosition: positionInterface;
    playerId: string;
    enemyId: string;
    angle: number;
    power: number;
}

export interface roomInterface {
    id: number;
    ownner: string;
    players: Array<playerRoomInterface>;
    map?: string;
    status: 'waiting' | 'playing' | 'finished';
}

interface playerRoomInterface {
    id: string;
    username: string;
}

export interface onlinePlayersInterface {
    userId: string;
    name: string;
    socketId: string;
}
