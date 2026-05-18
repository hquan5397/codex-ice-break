import { ConfigService } from '@nestjs/config';

const insecureProductionValues = new Set(['admin', 'admin123', 'change-me-in-production']);

export function validateProductionConfig(configService: ConfigService) {
  if (configService.get<string>('NODE_ENV') !== 'production') {
    return;
  }

  const requiredKeys = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'JWT_SECRET'];

  requiredKeys.forEach((key) => {
    const value = configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} is required in production`);
    }

    if (insecureProductionValues.has(value)) {
      throw new Error(`${key} must not use a local development default in production`);
    }
  });
}
