import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async createCategory(data: { name: string; restaurantId: string; order?: number }) {
    return this.prisma.category.create({ data });
  }

  async getCategories(restaurantId: string) {
    return this.prisma.category.findMany({
      where: { restaurantId },
      orderBy: { order: 'asc' },
    });
  }

  async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean;
    order?: number;
    categoryId: string;
    restaurantId: string;
  }) {
    return this.prisma.menuItem.create({ data });
  }

  async getMenu(restaurantId: string) {
    return this.prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      include: { category: true },
      orderBy: { order: 'asc' },
    });
  }

  async updateMenuItem(id: string, data: Record<string, unknown>) {
    return this.prisma.menuItem.update({ where: { id }, data });
  }

  async deleteMenuItem(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
