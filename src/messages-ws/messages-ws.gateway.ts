import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDTO } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) { }

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token) as JwtPayload;
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log(payload);


    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {

    this.messagesWsService.removeClient(client.id);

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }


  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDTO) {
    //messages-from-server

    //! Emite unicamente al cliente
    // client.emit('messages-from-server',{
    //   fullName: "Soy yo",
    //   message:payload.message|| 'No message!!'
    // });

    //! Emitir a todos menos al cliente inicial

    // client.broadcast.emit('messages-from-server',{
    //    fullName: "Soy yo",
    //    message:payload.message|| 'No message!!'
    //  });

    this.wss.to('clientID')

    this.wss.emit('messages-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'No message!!'
    });

  }
}





//  {
//              email: 'test1@google.com',
//             fullName: 'Test One',
//             password: bcrypt.hashSync( 'Abc123', 10 ),
//             roles: ['admin']
//         },
//         {
//             email: 'test2@google.com',
//             fullName: 'Test Two',
//             password: bcrypt.hashSync( 'Abc123', 10 ),
//             roles: ['user','super']
//         }