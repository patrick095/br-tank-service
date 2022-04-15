import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerConfig } from 'src/config/server.config';
import { UserController } from 'src/controllers/user/user.controller';
import { PlayerService } from 'src/services/player/player.service';
import { UserService } from 'src/services/user/user.service';
import { Player } from '../player/player.entity';
import { Users } from './user.entiry';

@Module({
    imports: [TypeOrmModule.forFeature([Users, Player])],
    providers: [UserService, PlayerService, ServerConfig],
    controllers: [UserController],
    exports: [TypeOrmModule],
})
export class UserModule {}
