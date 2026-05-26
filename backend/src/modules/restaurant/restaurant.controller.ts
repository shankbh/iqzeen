import { Controller, Get, Param, Put, Body, Post } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  findAll() {
    return this.restaurantService.findAll();
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
