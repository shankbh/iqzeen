import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { TableModule } from './modules/table/table.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [PrismaModule, RestaurantModule, TableModule, MenuModule, OrderModule, AuthModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
