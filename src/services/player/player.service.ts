import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from 'src/repository/player/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerService {
    constructor(
        @InjectRepository(Player)
        private playerRepository: Repository<Player>,
    ) {}

    async findOne(id: string): Promise<Player> {
        return await this.playerRepository.findOneById(id);
    }

    async findPlayers(user1Id: string, user2Id: string, resetPlayers = true): Promise<Array<Player>> {
        const savedPlayers = await this.playerRepository.findByIds([user1Id, user2Id]);

        const players = savedPlayers.map((player) => {
            return {
                ...player,
                angle: 0,
                position: {
                    x: 0,
                    y: 0,
                },
                hp: 100,
            };
        });
        if (resetPlayers) {
            players.forEach((player) => this.update(player));
        }
        return this.setPositions(players);
    }

    async create(name: string): Promise<Player> {
        const player = new Player();
        player.name = name;
        return await this.playerRepository.save(player);
    }

    async update(player: Player) {
        return await this.playerRepository.update(player._id.toString(), player);
    }

    async delete(id: number): Promise<Player> {
        const player = await this.playerRepository.findOneById(id);
        return await this.playerRepository.remove(player);
    }

    async find(ids: Array<string>): Promise<Array<Player>> {
        return await this.playerRepository.findByIds(ids);
    }

    private setPositions(players: Array<Player>): Array<Player> {
        const positions = [90, 670];
        players.forEach((player, index) => {
            player.position.x = positions[index];
        });
        return players;
    }
}
