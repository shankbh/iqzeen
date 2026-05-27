import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async adminLogin(email: string, password: string) {
    // If it's the default admin
    if (email === 'admin@iqzeen.com' && password === 'admin123') {
      let adminUser = await this.prisma.user.findUnique({ where: { email } });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(password, 10);
        adminUser = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: 'Super Admin',
            role: UserRole.SUPER_ADMIN,
          },
        });
      }
      return this.generateToken(adminUser);
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  async restaurantLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      include: { restaurant: true } 
    });

    if (!user || (user.role !== UserRole.OWNER && user.role !== UserRole.STAFF)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, restaurantId: user.restaurantId, restaurantSlug: user.restaurant?.slug };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantSlug: user.restaurant?.slug,
      }
    };
  }
}
