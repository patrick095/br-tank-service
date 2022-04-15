/* eslint-disable @typescript-eslint/indent */
import { playerInterface, positionInterface } from 'src/interfaces/player.interface';
import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Player implements playerInterface {
    @ObjectIdColumn()
    @Index({ unique: true })
    _id: ObjectID;

    @Column()
    name: string;

    @Column()
    position: positionInterface = {
        x: 0,
        y: 0,
    };

    @Column()
    team = 0;

    @Column()
    color = '#000000';

    @Column()
    hp = 100;

    $or: Array<any>;
}
