/* eslint-disable @typescript-eslint/indent */
import { userInterface } from 'src/interfaces/user.interface';
import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Users implements userInterface {
    @ObjectIdColumn()
    @Index({ unique: true })
    _id: ObjectID;

    @Column()
    name: string;

    @Column()
    @Index({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    @Index({ unique: true })
    email: string;

    @Column()
    playerId: string;

    $or: Array<any>;
}
