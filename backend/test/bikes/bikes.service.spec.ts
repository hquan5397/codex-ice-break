import { NotFoundException } from '@nestjs/common';
import { Bike } from '../../src/bikes/bike.entity';
import { BikesService } from '../../src/bikes/bikes.service';

type MockBikeRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneBy: jest.Mock;
};

function createMockRepository(): MockBikeRepository {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };
}

describe('BikesService', () => {
  let repository: MockBikeRepository;
  let service: BikesService;

  beforeEach(() => {
    repository = createMockRepository();
    service = new BikesService(repository as never);
  });

  it('creates a bike listing with decimal-safe price and ordered image URLs', async () => {
    const createdBike = {
      title: 'Yamaha R3',
      price: '68000000.00',
      imageUrl: 'http://localhost:3000/uploads/r3.webp',
      imageUrls: ['http://localhost:3000/uploads/r3.webp', 'http://localhost:3000/uploads/r3-side.webp'],
      sold: false,
    };

    repository.create.mockReturnValue(createdBike);
    repository.save.mockResolvedValue({ id: 'bike-1', ...createdBike });

    const result = await service.create(
      {
        title: 'Yamaha R3',
        price: 68000000,
      },
      ['http://localhost:3000/uploads/r3.webp', 'http://localhost:3000/uploads/r3-side.webp'],
    );

    expect(repository.create).toHaveBeenCalledWith({
      title: 'Yamaha R3',
      price: '68000000.00',
      imageUrl: 'http://localhost:3000/uploads/r3.webp',
      imageUrls: ['http://localhost:3000/uploads/r3.webp', 'http://localhost:3000/uploads/r3-side.webp'],
      sold: false,
    });
    expect(repository.save).toHaveBeenCalledWith(createdBike);
    expect(result).toEqual({ id: 'bike-1', ...createdBike });
  });

  it('returns public listings newest first and excludes sold bikes', async () => {
    const bikes = [{ id: 'bike-1' }] as Bike[];
    repository.find.mockResolvedValue(bikes);

    await expect(service.findAll()).resolves.toBe(bikes);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        sold: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('returns all listings for admin with selling bikes first', async () => {
    const bikes = [{ id: 'bike-1' }, { id: 'bike-2', sold: true }] as Bike[];
    repository.find.mockResolvedValue(bikes);

    await expect(service.findAllForAdmin()).resolves.toBe(bikes);

    expect(repository.find).toHaveBeenCalledWith({
      order: {
        sold: 'ASC',
        createdAt: 'DESC',
      },
    });
  });

  it('returns one listing by id', async () => {
    const bike = { id: 'bike-1', title: 'Honda SH' } as Bike;
    repository.findOneBy.mockResolvedValue(bike);

    await expect(service.findOne('bike-1')).resolves.toBe(bike);

    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'bike-1', sold: false });
  });

  it('throws NotFoundException when a listing does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('missing-bike')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates sold status for an existing listing', async () => {
    const bike = { id: 'bike-1', sold: false } as Bike;
    repository.findOneBy.mockResolvedValue(bike);
    repository.save.mockImplementation((updatedBike: Bike) => Promise.resolve(updatedBike));

    await expect(service.updateSold('bike-1', true)).resolves.toEqual({
      id: 'bike-1',
      sold: true,
    });

    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'bike-1' });
    expect(repository.save).toHaveBeenCalledWith({
      id: 'bike-1',
      sold: true,
    });
  });

  it('throws NotFoundException when updating sold status for a missing listing', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.updateSold('missing-bike', true)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates listing information without replacing the image', async () => {
    const bike = {
      id: 'bike-1',
      title: 'Old title',
      price: '68000000.00',
      brand: 'Honda',
      imageUrl: 'http://localhost:3000/uploads/old.webp',
      imageUrls: ['http://localhost:3000/uploads/old.webp'],
      sold: false,
    } as Bike;
    repository.findOneBy.mockResolvedValue(bike);
    repository.save.mockImplementation((updatedBike: Bike) => Promise.resolve(updatedBike));

    await expect(
      service.update('bike-1', {
        title: 'Honda SH 150i',
        price: 72000000,
        brand: 'Honda',
        sold: true,
      }),
    ).resolves.toEqual({
      id: 'bike-1',
      title: 'Honda SH 150i',
      price: '72000000.00',
      brand: 'Honda',
      imageUrl: 'http://localhost:3000/uploads/old.webp',
      imageUrls: ['http://localhost:3000/uploads/old.webp'],
      sold: true,
    });

    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'bike-1' });
    expect(repository.save).toHaveBeenCalledWith({
      id: 'bike-1',
      title: 'Honda SH 150i',
      price: '72000000.00',
      brand: 'Honda',
      imageUrl: 'http://localhost:3000/uploads/old.webp',
      imageUrls: ['http://localhost:3000/uploads/old.webp'],
      sold: true,
    });
  });

  it('updates listing information and replaces the images', async () => {
    const bike = {
      id: 'bike-1',
      title: 'Honda SH',
      price: '68000000.00',
      imageUrl: 'http://localhost:3000/uploads/old.webp',
      imageUrls: ['http://localhost:3000/uploads/old.webp'],
      sold: false,
    } as Bike;
    repository.findOneBy.mockResolvedValue(bike);
    repository.save.mockImplementation((updatedBike: Bike) => Promise.resolve(updatedBike));

    await expect(
      service.update(
        'bike-1',
        {
          description: 'Updated condition notes',
        },
        ['http://localhost:3000/uploads/new.webp', 'http://localhost:3000/uploads/new-side.webp'],
      ),
    ).resolves.toEqual({
      id: 'bike-1',
      title: 'Honda SH',
      price: '68000000.00',
      description: 'Updated condition notes',
      imageUrl: 'http://localhost:3000/uploads/new.webp',
      imageUrls: ['http://localhost:3000/uploads/new.webp', 'http://localhost:3000/uploads/new-side.webp'],
      sold: false,
    });
  });

  it('reorders existing listing images and updates the primary image', async () => {
    const bike = {
      id: 'bike-1',
      title: 'Honda SH',
      price: '68000000.00',
      imageUrl: 'http://localhost:3000/uploads/front.webp',
      imageUrls: ['http://localhost:3000/uploads/front.webp', 'http://localhost:3000/uploads/side.webp'],
      sold: false,
    } as Bike;
    repository.findOneBy.mockResolvedValue(bike);
    repository.save.mockImplementation((updatedBike: Bike) => Promise.resolve(updatedBike));

    await expect(
      service.update('bike-1', {
        imageUrls: ['http://localhost:3000/uploads/side.webp', 'http://localhost:3000/uploads/front.webp'],
      }),
    ).resolves.toMatchObject({
      imageUrl: 'http://localhost:3000/uploads/side.webp',
      imageUrls: ['http://localhost:3000/uploads/side.webp', 'http://localhost:3000/uploads/front.webp'],
    });
  });

  it('throws NotFoundException when updating a missing listing', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.update('missing-bike', { title: 'Honda SH' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('clears nullable listing fields during edits', async () => {
    const bike = {
      id: 'bike-1',
      title: 'Honda SH',
      price: '68000000.00',
      brand: 'Honda',
      model: 'SH',
      year: 2022,
      mileage: 12000,
      description: 'Clean bike',
      imageUrl: 'http://localhost:3000/uploads/old.webp',
      sold: false,
    } as Bike;
    repository.findOneBy.mockResolvedValue(bike);
    repository.save.mockImplementation((updatedBike: Bike) => Promise.resolve(updatedBike));

    await expect(
      service.update('bike-1', {
        brand: null,
        model: null,
        year: null,
        mileage: null,
        description: null,
      }),
    ).resolves.toMatchObject({
      brand: null,
      model: null,
      year: null,
      mileage: null,
      description: null,
    });
  });
});
