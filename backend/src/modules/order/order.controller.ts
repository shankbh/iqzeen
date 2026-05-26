import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() data: any) {
    return this.orderService.createOrder(data);
  }

  @Get('restaurant/:restaurantId')
  async findAll(@Param('restaurantId') restaurantId: string, @Body('status') status?: string) {
    return this.orderService.getOrders(restaurantId, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Get(':id/print')
  async print(@Param('id') id: string) {
    return this.orderService.getPrintBill(id);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.orderService.updateStatus(id, status);
  }
}
