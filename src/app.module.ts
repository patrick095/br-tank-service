import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { GameController } from './controllers/game/game.controller';
import { GameService } from './services/game/game.service';
import { UserService } from './services/user/user.service';

@Module({
    imports: [],
    controllers: [UserController, GameController],
    providers: [GameService, UserService],
})
export class AppModule {}
