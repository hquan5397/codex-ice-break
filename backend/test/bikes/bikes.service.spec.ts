import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { BikeBrand } from '../../src/bikes/bike-brand.enum';
import { Bike } from '../../src/bikes/bike.entity';
import { BikesService } from '../../src/bikes/bikes.service';

type MockBikeQueryBuilder = {
  andWhere: jest.Mock;
  getMany: jest.Mock;
  orderBy: jest.Mock;
  where: jest.Mock;
};

type MockBikeRepository = {
  createQueryBuilder: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneBy: jest.Mock;
};

function createMockQueryBuilder(): MockBikeQueryBuilder {
  const queryBuilder = {
    andWhere: jest.fn(),
    getMany: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
  };

  queryBuilder.where.mockReturnValue(queryBuilder);
  queryBuilder.andWhere.mockReturnValue(queryBuilder);
  queryBuilder.orderBy.mockReturnValue(queryBuilder);
  return queryBuilder;
}

function createMockRepository(): MockBikeRepository {
  return {
    createQueryBuilder: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };
}

describe('BikesService', () => {
  let repository: MockBikeRepository;
  let queryBuilder: MockBikeQueryBuilder;
  let service: BikesService;

  beforeEach(() => {
    queryBuilder = createMockQueryBuilder();
    repository = createMockRepository();
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
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

  it('rejects creating a bike listing without images', async () => {
    await expect(
      service.create(
        {
          title: 'Yamaha R3',
          price: 68000000,
        },
        [],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns public listings newest first and excludes sold bikes', async () => {
    const bikes = [{ id: 'bike-1' }] as Bike[];
    queryBuilder.getMany.mockResolvedValue(bikes);

    await expect(service.findAll()).resolves.toBe(bikes);

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('bike');
    expect(queryBuilder.where).toHaveBeenCalledWith('bike.sold = :sold', { sold: false });
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('bike.createdAt', 'DESC');
    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
  });

  it('filters public listings by selected brands and excludes sold bikes', async () => {
    const bikes = [{ id: 'bike-1', brand: BikeBrand.Honda }] as Bike[];
    queryBuilder.getMany.mockResolvedValue(bikes);

    await expect(service.findAll([BikeBrand.Honda, BikeBrand.Yamaha])).resolves.toBe(bikes);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('bike.brand IN (:...brands)', {
      brands: [BikeBrand.Honda, BikeBrand.Yamaha],
    });
  });

  it('searches public listings by title, brand, or model', async () => {
    const bikes = [{ id: 'bike-1', title: 'Honda SH' }] as Bike[];
    const searchWhere = jest.fn().mockReturnThis();
    const searchOrWhere = jest.fn().mockReturnThis();
    queryBuilder.andWhere.mockImplementation((condition) => {
      if (condition instanceof Brackets) {
        condition.whereFactory({
          where: searchWhere,
          orWhere: searchOrWhere,
        } as never);
      }

      return queryBuilder;
    });
    queryBuilder.getMany.mockResolvedValue(bikes);

    await expect(service.findAll([], '  sh  ')).resolves.toBe(bikes);

    expect(searchWhere).toHaveBeenCalledWith('LOWER(bike.title) LIKE LOWER(:search)', { search: '%sh%' });
    expect(searchOrWhere).toHaveBeenCalledWith('LOWER(bike.brand) LIKE LOWER(:search)', { search: '%sh%' });
    expect(searchOrWhere).toHaveBeenCalledWith('LOWER(bike.model) LIKE LOWER(:search)', { search: '%sh%' });
  });

  it('combines public listing search with selected brands', async () => {
    const bikes = [{ id: 'bike-1', brand: BikeBrand.Honda, model: 'SH' }] as Bike[];
    queryBuilder.getMany.mockResolvedValue(bikes);

    await expect(service.findAll([BikeBrand.Honda, BikeBrand.Yamaha], 'sh')).resolves.toBe(bikes);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('bike.brand IN (:...brands)', {
      brands: [BikeBrand.Honda, BikeBrand.Yamaha],
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.any(Brackets));
  });

  it('treats blank public listing search as no search filter', async () => {
    const bikes = [{ id: 'bike-1' }] as Bike[];
    queryBuilder.getMany.mockResolvedValue(bikes);

    await expect(service.findAll([], '   ')).resolves.toBe(bikes);

    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
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
      brand: BikeBrand.Honda,
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
        brand: BikeBrand.Honda,
        sold: true,
      }),
    ).resolves.toEqual({
      id: 'bike-1',
      title: 'Honda SH 150i',
      price: '72000000.00',
      brand: BikeBrand.Honda,
      imageUrl: 'http://localhost:3000/uploads/old.webp',
      imageUrls: ['http://localhost:3000/uploads/old.webp'],
      sold: true,
    });

    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'bike-1' });
    expect(repository.save).toHaveBeenCalledWith({
      id: 'bike-1',
      title: 'Honda SH 150i',
      price: '72000000.00',
      brand: BikeBrand.Honda,
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

  it('rejects updating a bike listing to an empty image list', async () => {
    const bike = {
      id: 'bike-1',
      title: 'Honda SH',
      price: '68000000.00',
      imageUrl: 'http://localhost:3000/uploads/old.webp',
      imageUrls: ['http://localhost:3000/uploads/old.webp'],
      sold: false,
    } as Bike;
    repository.findOneBy.mockResolvedValue(bike);

    await expect(service.update('bike-1', {}, [])).rejects.toBeInstanceOf(BadRequestException);
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
      brand: BikeBrand.Honda,
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
