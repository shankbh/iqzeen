import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Get payment details for an order:
   * - UPI ID + UPI deep link
   * - WhatsApp link pre-filled with the bill
   */
  @Get('details/:orderId')
  async getDetails(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentDetails(orderId);
  }

  /**
   * Staff marks the order as paid after customer pays via UPI/WhatsApp/Cash
   */
  @Post('mark-paid')
  async markPaid(
    @Body()
    data: {
      orderId: string;
      method: 'UPI' | 'WHATSAPP_UPI' | 'CASH';
      transactionId?: string; // optional UTR / reference number
    },
  ) {
    return this.paymentService.markPaid(
      data.orderId,
      data.method,
      data.transactionId,
    );
  }
}
