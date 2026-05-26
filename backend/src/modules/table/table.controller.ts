import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TableService } from './table.service';

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  async create(@Body() data: { tableNumber: string; restaurantId: string; qrCodeId: string }) {
    return this.tableService.create(data);
  }

  @Get('restaurant/:restaurantId')
  async findAll(@Param('restaurantId') restaurantId: string) {
    return this.tableService.findAll(restaurantId);
  }

  @Get('qr/:qrCodeId')
  async findByQr(@Param('qrCodeId') qrCodeId: string) {
    return this.tableService.findByQrId(qrCodeId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tableService.delete(id);
  }
}
