import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ServerConfig } from 'src/config/server.config';
import { UserInvalidException, UserNotFoundException, UserRegisteredException } from 'src/exceptions/user.exceptions';
import { findUserInterface, userInterface } from 'src/interfaces/user.interface';
import { Users } from 'src/repository/user/user.entiry';
import { PlayerService } from '../player/player.service';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        private config: ServerConfig,
        private playerService: PlayerService,
    ) {}

    async findOne({ username, email, password }: findUserInterface): Promise<Users> {
        const user = await this.usersRepository.findOne({
            where: {
                $or: [{ username }, { email }],
            },
        });
        if (!user) {
            throw new UserNotFoundException();
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UserInvalidException();
        }
        user.password = undefined;
        user.email = undefined;
        return user;
    }

    async create(user: userInterface): Promise<Users> {
        const registered = await this.usersRepository.findOne({
            where: {
                $or: [{ username: user.username }, { email: user.email }],
            },
        });
        if (registered) {
            throw new UserRegisteredException();
        }
        user.password = await bcrypt.hash(user.password, this.config.BCRYPT_SALT_ROUNDS);
        const player = await this.playerService.create(user.username);
        user.playerId = player._id.toString();
        const savedUser = await this.usersRepository.save(user);
        savedUser.password = undefined;
        savedUser.email = undefined;
        return savedUser;
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }
}
