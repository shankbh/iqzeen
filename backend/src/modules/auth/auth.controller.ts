import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() body: any) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Post('restaurant/login')
  @HttpCode(HttpStatus.OK)
  async restaurantLogin(@Body() body: any) {
    return this.authService.restaurantLogin(body.email, body.password);
  }
}
