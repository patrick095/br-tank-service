/* eslint-disable @typescript-eslint/indent */
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { gameInterface, onlinePlayersInterface, roomInterface, ShootInterface } from 'src/interfaces/game.interface';
import { Server } from 'socket.io';
import { ErrorCode } from 'src/enum/error.enum';
import { UserService } from 'src/services/user/user.service';
import { GameService } from 'src/services/game/game.service';
import { PlayerService } from 'src/services/player/player.service';
import { Game } from 'src/repository/game/game.entity';
import { playerInterface } from 'src/interfaces/player.interface';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit {
    private rooms: Array<roomInterface>;
    private onlinePlayers: Array<onlinePlayersInterface>;
    private server: Server;
    private gameCountDown: Array<{ interval: NodeJS.Timer; gameId: string }>;

    constructor(
        private readonly userService: UserService,
        private readonly gameService: GameService,
        private readonly playerService: PlayerService,
    ) {
        this.onlinePlayers = [];
        this.rooms = [];
        this.gameCountDown = [];
    }

    private async deleteAllGames(): Promise<void> {
        const deleted = await this.gameService.deleteAllGames();
        console.log('Deleted ' + deleted.affected + ' games');
    }

    afterInit(server: Server) {
        // this.deleteAllGames();
        this.server = server;
        server.on('connection', (socket) => {
            socket.on('id', ({ id, username }) => {
                const isOnline = this.onlinePlayers.find((player) => player.userId === id);
                if (!isOnline) {
                    this.onlinePlayers.push({ userId: id, socketId: socket.id, name: username });
                } else {
                    server.fetchSockets().then((s) => {
                        const userSocket = s.find((s) => s.id === isOnline.socketId);
                        userSocket?.emit('error', {
                            msg: ErrorCode[1],
                            code: 1,
                        });
                    });
                    socket.emit('error', { msg: ErrorCode[0], code: 0 });
                    socket.disconnect();
                }
                this.emitOnlinePlayers(server);
            });
            socket.on('disconnect', async () => {
                const index = this.onlinePlayers.findIndex((player) => player.socketId === socket.id);
                if (index >= 0) {
                    const playerId = this.onlinePlayers[index].userId;
                    const user = await this.userService.findById(playerId);
                    const game = await this.gameService.disconectedPlayer(user.playerId);
                    if (game) {
                        this.emitGame(game._id.toString(), game);
                    }
                    this.onlinePlayers.splice(index, 1);
                    this.emitOnlinePlayers(server);
                }
            });
        });
    }

    @SubscribeMessage('getOnlinePlayers')
    getOnlinePlayers(): void {
        this.emitOnlinePlayers(this.server);
    }

    @SubscribeMessage('listRooms')
    listRooms(): WsResponse<unknown> {
        return { event: 'listRooms', data: this.rooms };
    }

    @SubscribeMessage('newRoom')
    async newRoom(@MessageBody() userId: string): Promise<WsResponse<unknown>> {
        const user = await this.userService.findById(userId);
        const length = this.rooms.length;
        const id = length > 0 ? this.rooms[length - 1].id + 1 : 1;
        const room = {
            id,
            players: [{ id: user._id.toString(), username: user.username }],
            status: 'waiting',
            ownner: user._id.toString(),
        } as roomInterface;
        this.rooms.push(room);
        this.server.emit('listRooms', this.rooms);
        return { event: 'joinedRoom', data: room };
    }

    @SubscribeMessage('joinRoom')
    async joinRoom(@MessageBody() data: { userId: string; roomId: number }): Promise<WsResponse<unknown>> {
        const user = await this.userService.findById(data.userId);
        const index = this.rooms.findIndex((room) => room.id === data.roomId);
        if (index >= 0) {
            if (this.rooms[index].status === 'waiting' && this.rooms[index].players.length < 2) {
                if (!this.rooms[index].players.find((player) => player.id === user._id.toString())) {
                    this.rooms[index].players.push({ id: user._id.toString(), username: user.username });
                }
                this.server.emit('roomChanged' + data.roomId, this.rooms[index]);
                return { event: 'joinedRoom', data: this.rooms[index] };
            }
            return { event: 'error', data: { msg: ErrorCode[11], code: 11 } };
        }
        return { event: 'error', data: { msg: ErrorCode[12], code: 12 } };
    }

    @SubscribeMessage('leaveRoom')
    leaveRoom(@MessageBody() data: { userId: string; roomId: number }) {
        const index = this.rooms.findIndex((room) => room.id === data.roomId);
        if (index >= 0) {
            this.rooms[index].players = this.rooms[index].players.filter((player) => player.id !== data.userId);
            this.server.emit('roomChanged' + data.roomId, this.rooms[index]);
            if (this.rooms[index].players.length === 0) {
                const index = this.rooms.findIndex((room) => room.id === data.roomId);
                this.rooms.splice(index, 1);
                this.server.emit('listRooms', this.rooms);
                return;
            }
            this.rooms[index].ownner = this.rooms[index].players[0].id;
            this.server.emit('listRooms', this.rooms);
        }
    }

    @SubscribeMessage('chatRoom')
    async chatRoom(@MessageBody() data: { userId: string; roomId: number; message: string }) {
        const user = await this.userService.findById(data.userId);
        const index = this.rooms.findIndex((room) => room.id === data.roomId);
        if (index >= 0) {
            this.server.emit('chatRoom' + data.roomId, {
                username: user.username,
                message: data.message,
            });
        }
    }

    @SubscribeMessage('isInRoom')
    isInRoom(@MessageBody() userId: string): WsResponse<unknown> {
        const isInRoom = this.rooms.find((room) => room.players.find((player) => player.id === userId));
        return { event: 'isInRoom', data: isInRoom };
    }

    @SubscribeMessage('startRoom')
    async startRoom(@MessageBody() roomId) {
        const index = this.rooms.findIndex((room) => room.id === roomId);
        if (index >= 0) {
            if (this.rooms[index].players.length === 2) {
                const user1 = await this.userService.findById(this.rooms[index].players[0].id);
                const user2 = await this.userService.findById(this.rooms[index].players[1].id);
                const players = await this.playerService.findPlayers(user1.playerId, user2.playerId);
                this.rooms[index].status = 'playing';
                this.server.emit('listRoom', this.rooms[index]);
                const newGame = await this.gameService.newGame(players);
                this.sendStartGame(user1._id.toString(), newGame);
                this.sendStartGame(user2._id.toString(), newGame);
                this.startCountDown(newGame);
                return;
            }
            return { event: 'error', data: { msg: ErrorCode[13], code: 13 } };
        }
    }

    @SubscribeMessage('getGame')
    async getGame(@MessageBody() gameId: string): Promise<WsResponse<unknown>> {
        const game = await this.gameService.getGame(gameId);
        if (game) {
            const players = await this.playerService.findPlayers(game.players[0], game.players[1]);
            return { event: 'getGame', data: { game, players } };
        }
    }

    @SubscribeMessage('movePlayer')
    async movePlayer(@MessageBody() data: { player: playerInterface; gameId: string }) {
        const player = await this.playerService.findOne(data.player._id.toString());
        const game = await this.gameService.getGame(data.gameId);
        if (game && game.playerTurn === player._id.toString() && game.countdown > 0) {
            player.position = data.player.position;
            player.angle = data.player.angle;
            const result = await this.playerService.update(player);
            if (result.affected > 0) {
                this.emitGame(data.gameId, null, [player]);
            }
        }
    }

    @SubscribeMessage('shoot')
    async shoot(
        @MessageBody() data: { playerId: string; gameId: string; power: number },
    ): Promise<WsResponse<ShootInterface>> {
        const game = await this.gameService.getGame(data.gameId);
        const enemyId = game.players.find((p) => p !== data.playerId);
        const players = await this.playerService.findPlayers(data.playerId, enemyId);
        const player = players.find((p) => p._id.toString() === data.playerId);
        const enemy = players.find((p) => p._id.toString() === enemyId);
        const power = (data.power <= 50 && data.power >= 0 ? data.power : 50) / 2;

        const BulletInfo = {
            playerPosition: player.position,
            enemyPosition: enemy?.position,
            playerId: player._id.toString(),
            enemyId: enemy._id.toString(),
            angle: player.angle,
            power,
        };

        if (game && game.playerTurn === data.playerId && game.countdown > 0) {
            const countIndex = this.gameCountDown.findIndex((game) => game.gameId === data.gameId);
            clearInterval(this.gameCountDown[countIndex].interval);
            this.gameCountDown.splice(countIndex, 1);
            game.countdown = 0;
            this.nextTurn(game);
            return { event: 'shoot', data: BulletInfo };
        }
        return;
    }

    private sendStartGame(userId: string, game: gameInterface) {
        this.server.fetchSockets().then((s) => {
            const SocketId = s.find(
                (s) => s.id === this.onlinePlayers.find((player) => player.userId === userId).socketId,
            );
            const userSocket = s.find((s) => s.id === SocketId.id);
            userSocket.emit('gameStarted', game);
        });
    }

    private emitOnlinePlayers(socket: any) {
        const online = this.onlinePlayers.map((player) => player.name);
        socket.emit('onlinePlayers', online);
        socket.emit('listRooms', this.rooms);
    }

    private emitGame(gameId: string, game?: gameInterface, players?: Array<playerInterface>) {
        this.server.emit(`game-${gameId}`, { game, players });
    }

    private async startCountDown(game: Game) {
        const match = await this.gameService.startTurn(game);
        const interval = setInterval(async () => {
            if (match.status === 'playning' && match.turn <= 50) {
                match.countdown -= 1;
                if (match.countdown === 0) {
                    clearInterval(interval);
                    this.nextTurn(match);
                }
                this.emitGame(match._id.toString(), match);
            } else {
                clearInterval(interval);
            }
        }, 1300);
        this.gameCountDown.push({ interval, gameId: game._id.toString() });
    }

    private nextTurn(game: Game) {
        this.emitGame(game._id.toString(), game);
        setTimeout(async () => {
            this.emitGame(game._id.toString(), game);
            this.startCountDown(game);
        }, 3000);
    }
}
