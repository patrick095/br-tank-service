import { positionInterface } from '../interfaces/player.interface';

export class GameConfig {
    private countDown: number;
    private maxPower: number;
    private maxPlayers: number;
    private maxWindSpeed: number;
    private initialPositions: Array<positionInterface>;
    private tankSize: number;

    constructor() {
        this.countDown = 15;
        this.maxPower = 50;
        this.maxPlayers = 2;
        this.maxWindSpeed = 5;
        this.initialPositions = [
            { x: 90, y: 0 },
            { x: 670, y: 0 },
        ];
        this.tankSize = 14;
    }

    public get TankSize(): number {
        return this.tankSize;
    }

    public get CountDown(): number {
        return this.countDown;
    }

    public get MaxPower(): number {
        return this.maxPower;
    }

    public get MaxPlayers(): number {
        return this.maxPlayers;
    }

    public get MaxWindSpeed(): number {
        return this.maxWindSpeed;
    }

    public get InitialPositions(): Array<positionInterface> {
        return this.initialPositions;
    }
}
