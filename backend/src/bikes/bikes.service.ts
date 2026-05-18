import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { BikeBrand } from './bike-brand.enum';
import { Bike } from './bike.entity';
import { CreateBikeDto, UpdateBikeDto } from './commands';

@Injectable()
export class BikesService {
  constructor(
    @InjectRepository(Bike)
    private readonly bikesRepository: Repository<Bike>,
  ) {}

  async create(createBikeDto: CreateBikeDto, imageUrls: string[]): Promise<Bike> {
    if (imageUrls.length === 0) {
      throw new BadRequestException('At least one bike image is required');
    }

    const bike = this.bikesRepository.create({
      ...createBikeDto,
      price: createBikeDto.price.toFixed(2),
      imageUrl: imageUrls[0],
      imageUrls,
      sold: false,
    });

    return this.bikesRepository.save(bike);
  }

  findAll(brands: BikeBrand[] = [], search?: string): Promise<Bike[]> {
    const searchTerm = search?.trim();
    const queryBuilder = this.bikesRepository
      .createQueryBuilder('bike')
      .where('bike.sold = :sold', { sold: false })
      .orderBy('bike.createdAt', 'DESC');

    if (brands.length > 0) {
      queryBuilder.andWhere('bike.brand IN (:...brands)', { brands });
    }

    if (searchTerm) {
      queryBuilder.andWhere(
        new Brackets((searchQuery) => {
          searchQuery
            .where('LOWER(bike.title) LIKE LOWER(:search)', { search: `%${searchTerm}%` })
            .orWhere('LOWER(bike.brand) LIKE LOWER(:search)', { search: `%${searchTerm}%` })
            .orWhere('LOWER(bike.model) LIKE LOWER(:search)', { search: `%${searchTerm}%` });
        }),
      );
    }

    return queryBuilder.getMany();
  }

  findAllForAdmin(): Promise<Bike[]> {
    return this.bikesRepository.find({
      order: {
        sold: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Bike> {
    const bike = await this.bikesRepository.findOneBy({ id, sold: false });

    if (!bike) {
      throw new NotFoundException('Bike listing was not found');
    }

    return bike;
  }

  async updateSold(id: string, sold: boolean): Promise<Bike> {
    const bike = await this.bikesRepository.findOneBy({ id });

    if (!bike) {
      throw new NotFoundException('Bike listing was not found');
    }

    bike.sold = sold;
    return this.bikesRepository.save(bike);
  }

  async update(id: string, updateBikeDto: UpdateBikeDto, imageUrls?: string[]): Promise<Bike> {
    const bike = await this.bikesRepository.findOneBy({ id });

    if (!bike) {
      throw new NotFoundException('Bike listing was not found');
    }

    if (updateBikeDto.title !== undefined) {
      bike.title = updateBikeDto.title;
    }

    if (updateBikeDto.price !== undefined) {
      bike.price = updateBikeDto.price.toFixed(2);
    }

    if (updateBikeDto.brand !== undefined) {
      bike.brand = updateBikeDto.brand;
    }

    if (updateBikeDto.model !== undefined) {
      bike.model = updateBikeDto.model;
    }

    if (updateBikeDto.year !== undefined) {
      bike.year = updateBikeDto.year;
    }

    if (updateBikeDto.mileage !== undefined) {
      bike.mileage = updateBikeDto.mileage;
    }

    if (updateBikeDto.description !== undefined) {
      bike.description = updateBikeDto.description;
    }

    if (updateBikeDto.sold !== undefined) {
      bike.sold = updateBikeDto.sold;
    }

    if (imageUrls) {
      if (imageUrls.length === 0) {
        throw new BadRequestException('A listing must contain at least one image');
      }

      bike.imageUrls = imageUrls;
      bike.imageUrl = imageUrls[0];
    } else if (updateBikeDto.imageUrls) {
      bike.imageUrls = updateBikeDto.imageUrls;
      bike.imageUrl = updateBikeDto.imageUrls[0];
    } else if (!bike.imageUrls?.length) {
      bike.imageUrls = [bike.imageUrl];
    }

    return this.bikesRepository.save(bike);
  }
}
