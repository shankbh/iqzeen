import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KitchenGateway } from './kitchen.gateway';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private kitchenGateway: KitchenGateway,
  ) {}

  async createOrder(data: {
    tableId: string;
    restaurantId: string;
    customerName?: string;
    customerPhone?: string;
    items: {
      menuItemId: string;
      quantity: number;
      specialInstructions?: string;
      priceAtOrder: number;
    }[];
  }) {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        tableId: data.tableId,
        restaurantId: data.restaurantId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalAmount,
        items: { create: data.items },
      },
      include: { items: true },
    });

    this.kitchenGateway.emitOrderCreated(data.restaurantId, order);

    return order;
  }

  async getOrders(restaurantId: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        restaurantId,
        status: status ? (status as any) : undefined,
      },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } } },
    });
  }

  async getPrintBill(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        table: true,
        items: { include: { menuItem: true } },
      },
    });

    if (!order) return null;

    return {
      header: {
        name: order.restaurant.name,
        address: order.restaurant.address,
        phone: order.restaurant.phone,
      },
      orderInfo: {
        id: order.id,
        table: order.table.tableNumber,
        date: order.createdAt,
      },
      items: order.items.map((item) => ({
        name: item.menuItem.name,
        qty: item.quantity,
        price: item.priceAtOrder,
        subtotal: Number(item.quantity) * Number(item.priceAtOrder),
        note: item.specialInstructions,
      })),
      total: order.totalAmount,
    };
  }
}
