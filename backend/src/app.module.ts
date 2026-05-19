import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { AuthModule } from './auth/auth.module';
import { BikesModule } from './bikes/bikes.module';
import { validateProductionConfig } from './config/validate-production-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(process.cwd(), configService.get<string>('UPLOAD_DIR', 'uploads')),
          serveRoot: '/uploads',
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        validateProductionConfig(configService);

        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: Number(configService.get<string>('DATABASE_PORT', '5432')),
          username: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: configService.get<string>('DATABASE_NAME', 'motorbike_store'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('TYPEORM_SYNC', 'false') === 'true',
        };
      },
    }),
    AdminDashboardModule,
    AuthModule,
    BikesModule,
  ],
})
export class AppModule {}
