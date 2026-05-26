import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  async create(data: { tableNumber: string; restaurantId: string; qrCodeId: string }) {
    return this.prisma.table.create({ data });
  }

  async findAll(restaurantId: string) {
    return this.prisma.table.findMany({ where: { restaurantId } });
  }

  async findByQrId(qrCodeId: string) {
    return this.prisma.table.findUnique({ where: { qrCodeId } });
  }

  async delete(id: string) {
    return this.prisma.table.delete({ where: { id } });
  }
}
