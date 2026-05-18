import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBikeDto, UpdateBikeDto } from '../../src/bikes/commands';

describe('Bike DTO validation', () => {
  it('rejects whitespace-only create titles and empty create prices', async () => {
    const dto = plainToInstance(CreateBikeDto, {
      title: '   ',
      price: '',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['title', 'price']));
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
