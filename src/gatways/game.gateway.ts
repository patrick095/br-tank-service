/* eslint-disable @typescript-eslint/indent */
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { onlinePlayersInterface, roomInterface } from 'src/interfaces/game.interface';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit {
    private rooms: Array<roomInterface>;
    private onlinePlayers: Array<onlinePlayersInterface>;

    constructor() {
        this.onlinePlayers = [];
        this.rooms = [];
    }

    afterInit(server: Server) {
        server.on('connection', (socket) => {
            socket.on('id', ({ id, username }) => {
                const isOnline = this.onlinePlayers.find((player) => player.userId === id);
                if (!isOnline) {
                    this.onlinePlayers.push({ userId: id, socketId: socket.id, name: username });
                } else {
                    server.fetchSockets().then((s) => {
                        const userSocket = s.find((s) => s.id === isOnline.socketId);
                        userSocket.emit('error', {
                            msg: 'Você só pode abrir sua conta em um dispositivo por vez',
                            code: 1,
                        });
                    });
                    socket.emit('error', { msg: 'Você já está online em outro dispositivo', code: 0 });
                    socket.disconnect();
                }
                this.emitOnlinePlayers(server);
            });
            socket.on('disconnect', () => {
                const index = this.onlinePlayers.findIndex((player) => player.socketId === socket.id);
                this.onlinePlayers.splice(index, 1);
                this.emitOnlinePlayers(server);
            });
        });
    }

    private emitOnlinePlayers(socket: any) {
        const online = this.onlinePlayers.map((player) => player.name);
        socket.emit('onlinePlayers', online);
    }

    @SubscribeMessage('newRoom')
    startGame(@MessageBody() userId: string): WsResponse<unknown> {
        const id = this.rooms.length;
        const room = {
            id,
            players: [userId],
            status: 'waiting',
        } as roomInterface;
        this.rooms.push(room);
        return { event: 'roomCreated', data: this.rooms };
    }
}
