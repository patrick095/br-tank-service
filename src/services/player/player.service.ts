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
        return await this.playerRepository.findOne(id);
    }

    async create(name: string): Promise<Player> {
        const player = new Player();
        player.name = name;
        return await this.playerRepository.save(player);
    }

    async update(player: Player): Promise<Player> {
        return await this.playerRepository.save(player);
    }

    async delete(id: number): Promise<Player> {
        const player = await this.playerRepository.findOne(id);
        return await this.playerRepository.remove(player);
    }

    async find(ids: Array<string>): Promise<Array<Player>> {
        return await this.playerRepository.findByIds(ids);
    }
}
