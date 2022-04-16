import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { gameInterface } from 'src/interfaces/game.interface';
import { playerInterface } from 'src/interfaces/player.interface';
import { Game } from 'src/repository/game/game.entity';
import { Repository } from 'typeorm';
import { PlayerService } from '../player/player.service';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        private gameRepository: Repository<Game>,
        private readonly playerService: PlayerService,
    ) {}

    public async newGame(players: Array<playerInterface>): Promise<Game> {
        if (players.length < 2) {
            throw new Error('Not enough players');
        }
        const game = new Game();
        game.players = players.map((player) => player._id.toString());
        game.playerTurn = players[Math.round(Math.random())]?._id?.toString();
        game.wind = {
            angle: Math.round(Math.random() * 360),
            speed: Math.round(Math.random() * 5),
        };
        game.countdown = 15;
        game.turn = 0;
        game.winner = null;
        const saved = await this.gameRepository.save(game);
        return saved;
    }

    public async getGame(gameId: string): Promise<Game> {
        const game = await this.gameRepository.findOne(gameId);
        return game;
    }

    public async updateGame(gameId: string, game: gameInterface): Promise<number> {
        const updatedGame = await this.gameRepository.update(gameId, game);
        return updatedGame.affected;
    }

    public async disconectedPlayer(playerId: string): Promise<gameInterface> {
        const games = await this.gameRepository.find({ where: { status: 'playning' } });
        const game = games.find((game) => game.players.find((player) => player === playerId));
        if (game) {
            const winnerId = game.players.find((player) => player !== playerId);
            game.status = 'finished';
            game.winner = await this.playerService.findOne(winnerId);
            this.gameRepository.save(game);
            return game;
        }
    }

    public async startTurn(game: Game) {
        game.playerTurn = game.players.find((player) => player !== game.playerTurn);
        game.countdown = 15;
        game.turn += 1;
        game.wind.angle = Math.round(Math.random() * 360);
        game.wind.speed = Math.round(Math.random() * 5);
        this.gameRepository.update(game._id.toString(), game);
        return game;
    }

    public async deleteAllGames() {
        return await this.gameRepository.delete({});
    }
}
