import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BikeBrand } from '../../src/bikes/bike-brand.enum';
import { CreateBikeDto, UpdateBikeDto } from '../../src/bikes/commands';
import { GetPublicBikesDto } from '../../src/bikes/queries';

describe('Bike DTO validation', () => {
  it('rejects whitespace-only create titles and empty create prices', async () => {
    const dto = plainToInstance(CreateBikeDto, {
      title: '   ',
      price: '',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['title', 'price']));
  });

  it('accepts supported bike brands for create and update requests', async () => {
    const createDto = plainToInstance(CreateBikeDto, {
      title: 'Honda SH',
      price: '85000000',
      brand: BikeBrand.Honda,
    });
    const updateDto = plainToInstance(UpdateBikeDto, {
      brand: BikeBrand.Yamaha,
    });

    await expect(validate(createDto)).resolves.toHaveLength(0);
    await expect(validate(updateDto)).resolves.toHaveLength(0);
  });

  it('rejects unsupported bike brands', async () => {
    const createDto = plainToInstance(CreateBikeDto, {
      title: 'Unknown bike',
      price: '85000000',
      brand: 'Unknown',
    });
    const updateDto = plainToInstance(UpdateBikeDto, {
      brand: 'Unknown',
    });

    expect((await validate(createDto)).map((error) => error.property)).toContain('brand');
    expect((await validate(updateDto)).map((error) => error.property)).toContain('brand');
  });

  it('trims valid public listing search terms', async () => {
    const dto = plainToInstance(GetPublicBikesDto, {
      search: '  honda sh  ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('honda sh');
  });

  it('treats blank public listing search terms as empty filters', async () => {
    const dto = plainToInstance(GetPublicBikesDto, {
      search: '   ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.search).toBeUndefined();
  });

  it('rejects overly long public listing search terms', async () => {
    const dto = plainToInstance(GetPublicBikesDto, {
      search: 'a'.repeat(121),
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('search');
  });

  it('rejects whitespace-only update titles', async () => {
    const dto = plainToInstance(UpdateBikeDto, {
      title: '   ',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('title');
  });

  it('transforms empty editable optional fields to null so they can be cleared', async () => {
    const dto = plainToInstance(UpdateBikeDto, {
      brand: '',
      model: '',
      year: '',
      mileage: '',
      description: '',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto).toMatchObject({
      brand: null,
      model: null,
      year: null,
      mileage: null,
      description: null,
    });
  });

  it('transforms ordered image URLs from JSON strings', async () => {
    const dto = plainToInstance(UpdateBikeDto, {
      imageUrls: JSON.stringify(['http://localhost:3000/uploads/side.webp', 'http://localhost:3000/uploads/front.webp']),
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.imageUrls).toEqual(['http://localhost:3000/uploads/side.webp', 'http://localhost:3000/uploads/front.webp']);
  });

  it('rejects more than 8 ordered image URLs', async () => {
    const dto = plainToInstance(UpdateBikeDto, {
      imageUrls: JSON.stringify(Array.from({ length: 9 }, (_value, index) => `image-${index}.webp`)),
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('imageUrls');
  });

  it('transforms mixed image order tokens from JSON strings', async () => {
    const dto = plainToInstance(UpdateBikeDto, {
      imageOrder: JSON.stringify(['existing:http://localhost:3000/uploads/front.webp', 'new:0']),
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.imageOrder).toEqual(['existing:http://localhost:3000/uploads/front.webp', 'new:0']);
  });
});
