import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerConfig } from 'src/config/server.config';
import { GameGateway } from 'src/gatways/game.gateway';
import { GameService } from 'src/services/game/game.service';
import { PlayerService } from 'src/services/player/player.service';
import { UserService } from 'src/services/user/user.service';
import { Player } from '../player/player.entity';
import { Users } from '../user/user.entiry';
import { Game } from './game.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Game, Player, Users])],
    providers: [GameService, PlayerService, ServerConfig, GameGateway, UserService],
    controllers: [],
    exports: [TypeOrmModule],
})
export class GameModule {}
