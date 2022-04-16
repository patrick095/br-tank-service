/* eslint-disable @typescript-eslint/indent */
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { onlinePlayersInterface, roomInterface } from 'src/interfaces/game.interface';
import { Server } from 'socket.io';
import { ErrorCode } from 'src/enum/error.enum';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit {
    private rooms: Array<roomInterface>;
    private onlinePlayers: Array<onlinePlayersInterface>;
    private server: Server;

    constructor() {
        this.onlinePlayers = [];
        this.rooms = [];
    }

    afterInit(server: Server) {
        this.server = server;
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
        socket.emit('listRooms', this.rooms);
    }

    @SubscribeMessage('listRooms')
    listRooms(): WsResponse<unknown> {
        return { event: 'listRooms', data: this.rooms };
    }

    @SubscribeMessage('newRoom')
    newRoom(@MessageBody() userId: string): WsResponse<unknown> {
        const length = this.rooms.length;
        const id = length > 0 ? this.rooms[length - 1].id + 1 : 1;
        const room = {
            id,
            players: [userId],
            status: 'waiting',
        } as roomInterface;
        this.rooms.push(room);
        this.server.emit('listRooms', this.rooms);
        return { event: 'joinedRoom', data: room };
    }

    @SubscribeMessage('joinRoom')
    joinRoom(@MessageBody() data: { userId: string; roomId: number }): WsResponse<unknown> {
        const index = this.rooms.findIndex((room) => room.id === data.roomId);
        if (index >= 0) {
            if (this.rooms[index].status === 'waiting') {
                this.rooms[index].players.push(data.userId);
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
            this.rooms[index].players = this.rooms[index].players.filter((player) => player !== data.userId);
            this.server.emit('roomChanged' + data.roomId, this.rooms[index]);
            if (this.rooms[index].players.length === 0) {
                const index = this.rooms.findIndex((room) => room.id === data.roomId);
                this.rooms.splice(index, 1);
                this.server.emit('listRooms', this.rooms);
            }
            this.server.emit('listRooms', this.rooms);
        }
    }
}
