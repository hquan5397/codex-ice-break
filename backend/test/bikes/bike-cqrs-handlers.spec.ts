import {
  CreateBikeCommand,
  CreateBikeHandler,
  UpdateBikeCommand,
  UpdateBikeHandler,
  UpdateBikeSoldCommand,
  UpdateBikeSoldHandler,
} from '../../src/bikes/commands';
import { BikeBrand } from '../../src/bikes/bike-brand.enum';
import { GetAdminBikesHandler, GetBikeHandler, GetBikeQuery, GetPublicBikesHandler } from '../../src/bikes/queries';
import { GetPublicBikesQuery } from '../../src/bikes/queries/get-public-bikes';

describe('Bike CQRS handlers', () => {
  let bikesService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findAllForAdmin: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    updateSold: jest.Mock;
  };

  beforeEach(() => {
    bikesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllForAdmin: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateSold: jest.fn(),
    };
  });

  it('handles create bike commands', async () => {
    const bike = { id: 'bike-1' };
    bikesService.create.mockResolvedValue(bike);
    const handler = new CreateBikeHandler(bikesService as never);
    const command = new CreateBikeCommand(
      {
        title: 'Honda SH',
        price: 85000000,
      },
      ['http://localhost:3000/uploads/bike.webp'],
    );

    await expect(handler.execute(command)).resolves.toBe(bike);
    expect(bikesService.create).toHaveBeenCalledWith(command.createBikeDto, command.imageUrls);
  });

  it('handles update bike commands', async () => {
    const bike = { id: 'bike-1' };
    bikesService.update.mockResolvedValue(bike);
    const handler = new UpdateBikeHandler(bikesService as never);
    const command = new UpdateBikeCommand(
      'bike-1',
      {
        title: 'Updated Honda SH',
      },
      ['http://localhost:3000/uploads/new.webp'],
    );

    await expect(handler.execute(command)).resolves.toBe(bike);
    expect(bikesService.update).toHaveBeenCalledWith(command.id, command.updateBikeDto, command.imageUrls);
  });

  it('handles sold status commands', async () => {
    const bike = { id: 'bike-1', sold: true };
    bikesService.updateSold.mockResolvedValue(bike);
    const handler = new UpdateBikeSoldHandler(bikesService as never);

    await expect(handler.execute(new UpdateBikeSoldCommand('bike-1', true))).resolves.toBe(bike);
    expect(bikesService.updateSold).toHaveBeenCalledWith('bike-1', true);
  });

  it('handles public listing queries', async () => {
    const bikes = [{ id: 'bike-1' }];
    bikesService.findAll.mockResolvedValue(bikes);
    const handler = new GetPublicBikesHandler(bikesService as never);

    await expect(handler.execute(new GetPublicBikesQuery())).resolves.toBe(bikes);
    expect(bikesService.findAll).toHaveBeenCalledWith([], undefined);
  });

  it('passes public listing brand filters to the service', async () => {
    const bikes = [{ id: 'bike-1', brand: BikeBrand.Honda }];
    bikesService.findAll.mockResolvedValue(bikes);
    const handler = new GetPublicBikesHandler(bikesService as never);

    await expect(handler.execute(new GetPublicBikesQuery([BikeBrand.Honda, BikeBrand.Yamaha]))).resolves.toBe(bikes);
    expect(bikesService.findAll).toHaveBeenCalledWith([BikeBrand.Honda, BikeBrand.Yamaha], undefined);
  });

  it('passes public listing search to the service', async () => {
    const bikes = [{ id: 'bike-1', brand: BikeBrand.Honda, model: 'SH' }];
    bikesService.findAll.mockResolvedValue(bikes);
    const handler = new GetPublicBikesHandler(bikesService as never);

    await expect(handler.execute(new GetPublicBikesQuery([BikeBrand.Honda], 'sh'))).resolves.toBe(bikes);
    expect(bikesService.findAll).toHaveBeenCalledWith([BikeBrand.Honda], 'sh');
  });

  it('handles admin listing queries', async () => {
    const bikes = [{ id: 'bike-1' }, { id: 'bike-2', sold: true }];
    bikesService.findAllForAdmin.mockResolvedValue(bikes);
    const handler = new GetAdminBikesHandler(bikesService as never);

    await expect(handler.execute()).resolves.toBe(bikes);
    expect(bikesService.findAllForAdmin).toHaveBeenCalled();
  });

  it('handles listing detail queries', async () => {
    const bike = { id: 'bike-1' };
    bikesService.findOne.mockResolvedValue(bike);
    const handler = new GetBikeHandler(bikesService as never);

    await expect(handler.execute(new GetBikeQuery('bike-1'))).resolves.toBe(bike);
    expect(bikesService.findOne).toHaveBeenCalledWith('bike-1');
  });
});
