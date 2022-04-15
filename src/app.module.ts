import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './repository/user/user.entiry';
import { Game } from './repository/game/game.entity';
import { Player } from './repository/player/player.entity';
import { GameModule } from './repository/game/game.module';
import { UserModule } from './repository/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        TypeOrmModule.forRoot({
            type: 'mongodb',
            url: process.env.MONGODB_URI,
            entities: [Users, Game, Player],
            useNewUrlParser: true,
            useUnifiedTopology: true,
            database: process.env.MONGODB_NAME,
        }),
        GameModule,
        UserModule,
        UserModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
