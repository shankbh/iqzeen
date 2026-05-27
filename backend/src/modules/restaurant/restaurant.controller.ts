import { Controller, Get, Param, Put, Body, Post, HttpException } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  async findAll() {
    try {
      return await this.restaurantService.findAll();
    } catch (e: any) {
      throw new HttpException(e.message || String(e), 400);
    }
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.restaurantService.findBySlug(slug);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.restaurantService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: { upiId?: string; whatsappNumber?: string; name?: string; phone?: string; address?: string }) {
    return this.restaurantService.update(id, data);
  }

  @Post()
  create(@Body() data: any) {
    return this.restaurantService.create(data);
  }
}
