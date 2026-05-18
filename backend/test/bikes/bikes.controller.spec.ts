import { BadRequestException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ConfigService } from '@nestjs/config';
import { readFile, unlink } from 'fs/promises';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { Bike } from '../../src/bikes/bike.entity';
import { BikesController } from '../../src/bikes/bikes.controller';
import { BikesService } from '../../src/bikes/bikes.service';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  unlink: jest.fn(),
}));

describe('BikesController', () => {
  let bikesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findAllForAdmin: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    updateSold: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };
  let controller: BikesController;

  beforeEach(() => {
    jest.mocked(readFile).mockResolvedValue(Buffer.from('RIFFxxxxWEBPmore'));
    jest.mocked(unlink).mockResolvedValue(undefined);
    bikesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllForAdmin: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateSold: jest.fn(),
    };
    configService = {
      get: jest.fn((_key: string, defaultValue: string) => defaultValue),
    };
    controller = new BikesController(
      bikesService as unknown as BikesService,
      configService as unknown as ConfigService,
    );
  });

  it('returns all bike listings', async () => {
    const bikes = [{ id: 'bike-1' }] as Bike[];
    bikesService.findAll.mockResolvedValue(bikes);

    await expect(controller.findAll()).resolves.toBe(bikes);
  });

  it('returns all bike listings for admin', async () => {
    const bikes = [{ id: 'bike-1' }, { id: 'bike-2', sold: true }] as Bike[];
    bikesService.findAllForAdmin.mockResolvedValue(bikes);

    await expect(controller.findAllForAdmin()).resolves.toBe(bikes);
  });

  it('returns one bike listing', async () => {
    const bike = { id: 'bike-1' } as Bike;
    bikesService.findOne.mockResolvedValue(bike);

    await expect(controller.findOne('bike-1')).resolves.toBe(bike);
    expect(bikesService.findOne).toHaveBeenCalledWith('bike-1');
  });

  it('creates a bike listing with the configured public image URL', async () => {
    const bike = { id: 'bike-1' } as Bike;
    configService.get.mockReturnValue('https://api.example.test');
    bikesService.create.mockResolvedValue(bike);

    const result = await controller.create(
      {
        title: 'Honda SH',
        price: 85000000,
      },
      [
        {
          filename: 'bike.webp',
          path: 'uploads/bike.webp',
        },
        {
          filename: 'bike-side.webp',
          path: 'uploads/bike-side.webp',
        },
      ] as Express.Multer.File[],
    );

    expect(result).toBe(bike);
    expect(configService.get).toHaveBeenCalledWith('API_PUBLIC_URL', 'http://localhost:3000');
    expect(bikesService.create).toHaveBeenCalledWith(
      {
        title: 'Honda SH',
        price: 85000000,
      },
      ['https://api.example.test/uploads/bike.webp', 'https://api.example.test/uploads/bike-side.webp'],
    );
  });

  it('updates sold status for a bike listing', async () => {
    const bike = { id: 'bike-1', sold: true } as Bike;
    bikesService.updateSold.mockResolvedValue(bike);

    await expect(controller.updateSold('bike-1', { sold: true })).resolves.toBe(bike);

    expect(bikesService.updateSold).toHaveBeenCalledWith('bike-1', true);
  });

  it('updates a bike listing without replacing the image', async () => {
    const bike = { id: 'bike-1', title: 'Honda SH 150i' } as Bike;
    bikesService.update.mockResolvedValue(bike);

    await expect(
      controller.update('bike-1', {
        title: 'Honda SH 150i',
        price: 72000000,
      }, []),
    ).resolves.toBe(bike);

    expect(configService.get).toHaveBeenCalledWith('API_PUBLIC_URL', 'http://localhost:3000');
    expect(bikesService.update).toHaveBeenCalledWith(
      'bike-1',
      {
        title: 'Honda SH 150i',
        price: 72000000,
      },
      undefined,
    );
  });

  it('updates a bike listing with a replacement image URL', async () => {
    const bike = { id: 'bike-1', imageUrl: 'https://api.example.test/uploads/new.webp' } as Bike;
    configService.get.mockReturnValue('https://api.example.test');
    bikesService.update.mockResolvedValue(bike);

    await expect(
      controller.update(
        'bike-1',
        {
          title: 'Honda SH 150i',
        },
        [
          {
            filename: 'new.webp',
            path: 'uploads/new.webp',
          },
        ] as Express.Multer.File[],
      ),
    ).resolves.toBe(bike);

    expect(bikesService.update).toHaveBeenCalledWith(
      'bike-1',
      {
        title: 'Honda SH 150i',
      },
      ['https://api.example.test/uploads/new.webp'],
    );
  });

  it('preserves mixed existing and uploaded image order', async () => {
    const bike = { id: 'bike-1', imageUrl: 'https://api.example.test/uploads/new.webp' } as Bike;
    configService.get.mockReturnValue('https://api.example.test');
    bikesService.update.mockResolvedValue(bike);

    await expect(
      controller.update(
        'bike-1',
        {
          imageUrls: ['https://api.example.test/uploads/front.webp'],
          imageOrder: ['new:0', 'existing:https://api.example.test/uploads/front.webp'],
        },
        [
          {
            filename: 'new.webp',
            path: 'uploads/new.webp',
          },
        ] as Express.Multer.File[],
      ),
    ).resolves.toBe(bike);

    expect(bikesService.update).toHaveBeenCalledWith(
      'bike-1',
      {
        imageUrls: ['https://api.example.test/uploads/front.webp'],
        imageOrder: ['new:0', 'existing:https://api.example.test/uploads/front.webp'],
      },
      ['https://api.example.test/uploads/new.webp', 'https://api.example.test/uploads/front.webp'],
    );
  });

  it('reorders existing bike listing images without uploading files', async () => {
    const bike = { id: 'bike-1', imageUrl: 'https://api.example.test/uploads/side.webp' } as Bike;
    bikesService.update.mockResolvedValue(bike);

    await expect(
      controller.update(
        'bike-1',
        {
          imageUrls: ['https://api.example.test/uploads/side.webp', 'https://api.example.test/uploads/front.webp'],
        },
        [],
      ),
    ).resolves.toBe(bike);

    expect(bikesService.update).toHaveBeenCalledWith(
      'bike-1',
      {
        imageUrls: ['https://api.example.test/uploads/side.webp', 'https://api.example.test/uploads/front.webp'],
      },
      undefined,
    );
  });

  it('rejects uploaded files with invalid image content and removes them', async () => {
    jest.mocked(readFile).mockResolvedValue(Buffer.from('not an image'));

    await expect(
      controller.create(
        {
          title: 'Honda SH',
          price: 85000000,
        },
        [
          {
            filename: 'fake.webp',
            path: 'uploads/fake.webp',
          },
          {
            filename: 'other.webp',
            path: 'uploads/other.webp',
          },
        ] as Express.Multer.File[],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(unlink).toHaveBeenCalledWith('uploads/fake.webp');
    expect(unlink).toHaveBeenCalledWith('uploads/other.webp');
    expect(bikesService.create).not.toHaveBeenCalled();
  });

  it('removes uploaded create images when persistence fails', async () => {
    bikesService.create.mockRejectedValue(new Error('database down'));

    await expect(
      controller.create(
        {
          title: 'Honda SH',
          price: 85000000,
        },
        [
          {
            filename: 'bike.webp',
            path: 'uploads/bike.webp',
          },
        ] as Express.Multer.File[],
      ),
    ).rejects.toThrow('database down');

    expect(unlink).toHaveBeenCalledWith('uploads/bike.webp');
  });

  it('removes uploaded update images when persistence fails', async () => {
    bikesService.update.mockRejectedValue(new Error('missing listing'));

    await expect(
      controller.update(
        'bike-1',
        {
          title: 'Honda SH',
        },
        [
          {
            filename: 'new.webp',
            path: 'uploads/new.webp',
          },
        ] as Express.Multer.File[],
      ),
    ).rejects.toThrow('missing listing');

    expect(unlink).toHaveBeenCalledWith('uploads/new.webp');
  });

  it('rejects create requests without an image', async () => {
    await expect(
      controller.create({
        title: 'Honda SH',
        price: 85000000,
      }, []),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires admin authentication for create requests', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, BikesController.prototype.create);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('requires admin authentication for admin listing requests', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, BikesController.prototype.findAllForAdmin);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('requires admin authentication for sold status updates', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, BikesController.prototype.updateSold);

    expect(guards).toContain(JwtAuthGuard);
  });

  it('requires admin authentication for listing updates', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, BikesController.prototype.update);

    expect(guards).toContain(JwtAuthGuard);
  });
});
