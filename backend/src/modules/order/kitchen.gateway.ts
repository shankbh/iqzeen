import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class KitchenGateway {
  @WebSocketServer()
  server: Server;

  // ─── Restaurant room (kitchen staff) ────────────────────────────────────────
  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(@ConnectedSocket() client: Socket, @MessageBody() restaurantId: string) {
    client.join(restaurantId);
    return { event: 'joined', restaurantId };
  }

  emitOrderCreated(restaurantId: string, order: any) {
    this.server.to(restaurantId).emit('orderCreated', order);
  }

  // ─── Table room (Group Cart + Live Status) ──────────────────────────────────
  @SubscribeMessage('table:join')
  handleTableJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string; userId: string; userName?: string },
  ) {
    client.join(`table:${data.tableId}`);
    // Notify others that someone joined
    client.to(`table:${data.tableId}`).emit('table:user-joined', {
      userId: data.userId,
      userName: data.userName ?? `Guest`,
    });
    return { event: 'table:joined', tableId: data.tableId };
  }

  @SubscribeMessage('table:leave')
  handleTableLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string; userId: string },
  ) {
    client.leave(`table:${data.tableId}`);
    client.to(`table:${data.tableId}`).emit('table:user-left', { userId: data.userId });
  }

  // ─── Group Cart Sync ─────────────────────────────────────────────────────────
  @SubscribeMessage('cart:add')
  handleCartAdd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string; item: any; userId: string; userName: string },
  ) {
    // Relay to all OTHER devices at this table
    client.to(`table:${data.tableId}`).emit('cart:item-added', {
      item: data.item,
      userId: data.userId,
      userName: data.userName,
    });
  }

  @SubscribeMessage('cart:remove')
  handleCartRemove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string; itemId: string; userId: string },
  ) {
    client.to(`table:${data.tableId}`).emit('cart:item-removed', {
      itemId: data.itemId,
      userId: data.userId,
    });
  }

  @SubscribeMessage('cart:clear')
  handleCartClear(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string },
  ) {
    client.to(`table:${data.tableId}`).emit('cart:cleared', {});
  }

  // ─── Live Kitchen Status ─────────────────────────────────────────────────────
  @SubscribeMessage('order:status-update')
  handleOrderStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tableId: string; orderId: string; status: string; itemStatuses?: any[] },
  ) {
    // Kitchen staff sends update → broadcast to customer's table
    this.server.to(`table:${data.tableId}`).emit('order:status-changed', {
      orderId: data.orderId,
      status: data.status,
      itemStatuses: data.itemStatuses ?? [],
    });
  }

  // ─── Table-to-Table Gifting ──────────────────────────────────────────────────
  @SubscribeMessage('gift:send')
  handleGiftSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { fromTable: string; toTable: string; itemName: string; message: string },
  ) {
    this.server.to(`table:${data.toTable}`).emit('gift:received', {
      fromTable: data.fromTable,
      itemName: data.itemName,
      message: data.message,
    });
  }
}
