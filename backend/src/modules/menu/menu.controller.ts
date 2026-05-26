import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post('category')
  async createCategory(@Body() data: { name: string; restaurantId: string; order?: number }) {
    return this.menuService.createCategory(data);
  }

  @Get('categories/:restaurantId')
  async getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getCategories(restaurantId);
  }

  @Post('item')
  async createItem(@Body() data: any) {
    return this.menuService.createMenuItem(data);
  }

  @Get('restaurant/:restaurantId')
  async getMenu(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getMenu(restaurantId);
  }

  @Put('item/:id')
  async updateItem(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.menuService.updateMenuItem(id, data);
  }

  @Delete('item/:id')
  async deleteItem(@Param('id') id: string) {
    return this.menuService.deleteMenuItem(id);
  }
}
