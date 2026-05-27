import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.restaurant.findMany();
  }

  async findBySlug(slug: string) {
    return this.prisma.restaurant.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    return this.prisma.restaurant.findUnique({ where: { id } });
  }

  async update(id: string, data: { upiId?: string; whatsappNumber?: string; name?: string; phone?: string; address?: string }) {
    return this.prisma.restaurant.update({ where: { id }, data });
  }

  async create(data: any) {
    const { password, bankDetails, ...restaurantData } = data;
    const finalData = { ...restaurantData };
    if (bankDetails !== undefined) {
      finalData.bankAccountDetails = bankDetails;
    }
    const restaurant = await this.prisma.restaurant.create({ data: finalData });

    if (password) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.prisma.user.create({
        data: {
          email: restaurantData.email,
          password: hashedPassword,
          name: restaurantData.ownerName || 'Owner',
          role: 'OWNER',
          restaurantId: restaurant.id,
        },
      });
    }
    return restaurant;
  }
}
