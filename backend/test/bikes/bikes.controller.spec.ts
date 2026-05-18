import { BadRequestException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { readFile, unlink } from 'fs/promises';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { BikeBrand } from '../../src/bikes/bike-brand.enum';
import { Bike } from '../../src/bikes/bike.entity';
import { BikesController } from '../../src/bikes/bikes.controller';
import { CreateBikeCommand, UpdateBikeCommand, UpdateBikeSoldCommand } from '../../src/bikes/commands';
import { GetAdminBikesQuery, GetBikeQuery, GetPublicBikesQuery } from '../../src/bikes/queries';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  unlink: jest.fn(),
}));

describe('BikesController', () => {
  let commandBus: {
    execute: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };
  let queryBus: {
    execute: jest.Mock;
  };
  let controller: BikesController;

  beforeEach(() => {
    jest.mocked(readFile).mockResolvedValue(Buffer.from('RIFFxxxxWEBPmore'));
    jest.mocked(unlink).mockResolvedValue(undefined);
    commandBus = {
      execute: jest.fn(),
    };
    configService = {
      get: jest.fn((_key: string, defaultValue: string) => defaultValue),
    };
    queryBus = {
      execute: jest.fn(),
    };
    controller = new BikesController(
      commandBus as unknown as CommandBus,
      configService as unknown as ConfigService,
      queryBus as unknown as QueryBus,
    );
  });

  it('returns all bike listings', async () => {
    const bikes = [{ id: 'bike-1' }] as Bike[];
    queryBus.execute.mockResolvedValue(bikes);

    await expect(controller.findAll({})).resolves.toBe(bikes);
    expect(queryBus.execute).toHaveBeenCalledWith(new GetPublicBikesQuery());
  });

  it('returns bike listings filtered by brands', async () => {
    const bikes = [{ id: 'bike-1', brand: BikeBrand.Honda }] as Bike[];
    queryBus.execute.mockResolvedValue(bikes);

    await expect(controller.findAll({ brand: [BikeBrand.Honda, BikeBrand.Yamaha] })).resolves.toBe(bikes);
    expect(queryBus.execute).toHaveBeenCalledWith(new GetPublicBikesQuery([BikeBrand.Honda, BikeBrand.Yamaha]));
  });

  it('returns all bike listings for admin', async () => {
    const bikes = [{ id: 'bike-1' }, { id: 'bike-2', sold: true }] as Bike[];
    queryBus.execute.mockResolvedValue(bikes);

    await expect(controller.findAllForAdmin()).resolves.toBe(bikes);
    expect(queryBus.execute).toHaveBeenCalledWith(new GetAdminBikesQuery());
  });

  it('returns one bike listing', async () => {
    const bike = { id: 'bike-1' } as Bike;
    queryBus.execute.mockResolvedValue(bike);

    await expect(controller.findOne('bike-1')).resolves.toBe(bike);
    expect(queryBus.execute).toHaveBeenCalledWith(new GetBikeQuery('bike-1'));
  });

  it('creates a bike listing with the configured public image URL', async () => {
    const bike = { id: 'bike-1' } as Bike;
    configService.get.mockReturnValue('https://api.example.test');
    commandBus.execute.mockResolvedValue(bike);

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
    expect(commandBus.execute).toHaveBeenCalledWith(
      new CreateBikeCommand(
        {
          title: 'Honda SH',
          price: 85000000,
        },
        ['https://api.example.test/uploads/bike.webp', 'https://api.example.test/uploads/bike-side.webp'],
      ),
    );
  });

  it('updates sold status for a bike listing', async () => {
    const bike = { id: 'bike-1', sold: true } as Bike;
    commandBus.execute.mockResolvedValue(bike);

    await expect(controller.updateSold('bike-1', { sold: true })).resolves.toBe(bike);

    expect(commandBus.execute).toHaveBeenCalledWith(new UpdateBikeSoldCommand('bike-1', true));
  });

  it('updates a bike listing without replacing the image', async () => {
    const bike = { id: 'bike-1', title: 'Honda SH 150i' } as Bike;
    commandBus.execute.mockResolvedValue(bike);

    await expect(
      controller.update('bike-1', {
        title: 'Honda SH 150i',
        price: 72000000,
      }, []),
    ).resolves.toBe(bike);

    expect(configService.get).toHaveBeenCalledWith('API_PUBLIC_URL', 'http://localhost:3000');
    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateBikeCommand(
        'bike-1',
        {
          title: 'Honda SH 150i',
          price: 72000000,
        },
        undefined,
      ),
    );
  });

  it('updates a bike listing with a replacement image URL', async () => {
    const bike = { id: 'bike-1', imageUrl: 'https://api.example.test/uploads/new.webp' } as Bike;
    configService.get.mockReturnValue('https://api.example.test');
    commandBus.execute.mockResolvedValue(bike);

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

    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateBikeCommand(
        'bike-1',
        {
          title: 'Honda SH 150i',
        },
        ['https://api.example.test/uploads/new.webp'],
      ),
    );
  });

  it('preserves mixed existing and uploaded image order', async () => {
    const bike = { id: 'bike-1', imageUrl: 'https://api.example.test/uploads/new.webp' } as Bike;
    configService.get.mockReturnValue('https://api.example.test');
    commandBus.execute.mockResolvedValue(bike);

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

    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateBikeCommand(
        'bike-1',
        {
          imageUrls: ['https://api.example.test/uploads/front.webp'],
          imageOrder: ['new:0', 'existing:https://api.example.test/uploads/front.webp'],
        },
        ['https://api.example.test/uploads/new.webp', 'https://api.example.test/uploads/front.webp'],
      ),
    );
  });

  it('rejects image order tokens for missing uploaded images', async () => {
    configService.get.mockReturnValue('https://api.example.test');

    await expect(
      controller.update(
        'bike-1',
        {
          imageOrder: ['new:99'],
        },
        [
          {
            filename: 'new.webp',
            path: 'uploads/new.webp',
          },
        ] as Express.Multer.File[],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(unlink).toHaveBeenCalledWith('uploads/new.webp');
  });

  it('rejects image order tokens for unknown existing images', async () => {
    await expect(
      controller.update(
        'bike-1',
        {
          imageUrls: ['https://api.example.test/uploads/front.webp'],
          imageOrder: ['existing:https://api.example.test/uploads/other.webp'],
        },
        [],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('rejects merged image updates with more than 8 images', async () => {
    await expect(
      controller.update(
        'bike-1',
        {
          imageUrls: Array.from({ length: 8 }, (_value, index) => `https://api.example.test/uploads/${index}.webp`),
        },
        [
          {
            filename: 'new.webp',
            path: 'uploads/new.webp',
          },
        ] as Express.Multer.File[],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(commandBus.execute).not.toHaveBeenCalled();
    expect(unlink).toHaveBeenCalledWith('uploads/new.webp');
  });

  it('reorders existing bike listing images without uploading files', async () => {
    const bike = { id: 'bike-1', imageUrl: 'https://api.example.test/uploads/side.webp' } as Bike;
    commandBus.execute.mockResolvedValue(bike);

    await expect(
      controller.update(
        'bike-1',
        {
          imageUrls: ['https://api.example.test/uploads/side.webp', 'https://api.example.test/uploads/front.webp'],
        },
        [],
      ),
    ).resolves.toBe(bike);

    expect(commandBus.execute).toHaveBeenCalledWith(
      new UpdateBikeCommand(
        'bike-1',
        {
          imageUrls: ['https://api.example.test/uploads/side.webp', 'https://api.example.test/uploads/front.webp'],
        },
        undefined,
      ),
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
    expect(commandBus.execute).not.toHaveBeenCalled();
  });

  it('removes uploaded create images when persistence fails', async () => {
    commandBus.execute.mockRejectedValue(new Error('database down'));

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
    commandBus.execute.mockRejectedValue(new Error('missing listing'));

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
