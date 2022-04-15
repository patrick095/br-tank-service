/* eslint-disable @typescript-eslint/indent */
import { gameInterface, windInterface } from 'src/interfaces/game.interface';
import { playerInterface } from 'src/interfaces/player.interface';
import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';
@Entity()
export class Game implements gameInterface {
    @ObjectIdColumn()
    @Index({ unique: true })
    _id: ObjectID;

    @Column()
    wind: windInterface;

    @Column()
    players: Array<playerInterface>;

    @Column()
    playerTurn: string;

    @Column()
    turn: number;

    @Column()
    winner: string;

    @Column()
    countdown: number;

    $or: Array<any>;
}
