/* eslint-disable @typescript-eslint/indent */
import { gameInterface, windInterface } from 'src/interfaces/game.interface';
import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';
import { Player } from '../player/player.entity';
@Entity()
export class Game implements gameInterface {
    @ObjectIdColumn()
    @Index({ unique: true })
    _id: ObjectID;

    @Column()
    wind: windInterface;

    @Column()
    players: Array<string>;

    @Column()
    playerTurn: string;

    @Column()
    turn: number;

    @Column()
    winner: Player;

    @Column()
    countdown: number;

    @Column()
    status: 'playning' | 'finished' = 'playning';

    $or: Array<any>;
}
