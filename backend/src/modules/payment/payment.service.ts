import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PaymentDetails {
  orderId: string;
  amount: number;
  restaurantName: string;
  tableNumber: string;
  upiId: string | null;
  whatsappNumber: string | null;
  upiLink: string | null;
  whatsappLink: string | null;
  billSummary: {
    items: { name: string; qty: number; price: number; subtotal: number }[];
    total: number;
  };
}

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getPaymentDetails(orderId: string): Promise<PaymentDetails> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: true,
        table: true,
        items: { include: { menuItem: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const amount = Number(order.totalAmount);
    const restaurantName = order.restaurant.name;
    const tableNumber = order.table.tableNumber;
    const upiId = order.restaurant.upiId ?? null;
    const whatsappNumber = order.restaurant.whatsappNumber ?? null;

    // Build bill text for WhatsApp message
    const itemLines = order.items
      .map(
        (i) =>
          `${i.menuItem.name} x${i.quantity} = ₹${Number(i.priceAtOrder) * i.quantity}`,
      )
      .join('%0A'); // URL-encoded newline

    const whatsappText =
      `*Bill from ${restaurantName}*%0A` +
      `Table: ${tableNumber}%0A` +
      `Order ID: ${orderId.slice(-8).toUpperCase()}%0A%0A` +
      `${itemLines}%0A%0A` +
      `*Total: ₹${amount}*%0A%0A` +
      (upiId ? `Please pay to UPI: *${upiId}*` : '');

    // UPI deep link (works with PhonePe, GPay, Paytm, etc.)
    const upiLink = upiId
      ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(restaurantName)}&am=${amount}&cu=INR&tn=Order+${orderId.slice(-8).toUpperCase()}`
      : null;

    // WhatsApp link — if restaurant has whatsapp number, send them the bill
    const whatsappLink = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${whatsappText}`
      : null;

    return {
      orderId,
      amount,
      restaurantName,
      tableNumber,
      upiId,
      whatsappNumber,
      upiLink,
      whatsappLink,
      billSummary: {
        items: order.items.map((i) => ({
          name: i.menuItem.name,
          qty: i.quantity,
          price: Number(i.priceAtOrder),
          subtotal: Number(i.priceAtOrder) * i.quantity,
        })),
        total: amount,
      },
    };
  }

  async markPaid(
    orderId: string,
    method: 'UPI' | 'WHATSAPP_UPI' | 'CASH',
    transactionId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.upsert({
        where: { orderId },
        update: {
          method,
          transactionId: transactionId ?? null,
          status: 'COMPLETED',
        },
        create: {
          orderId,
          method,
          transactionId: transactionId ?? null,
          amount: order.totalAmount,
          status: 'COMPLETED',
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      }),
    ]);

    return { success: true, payment };
  }
}
