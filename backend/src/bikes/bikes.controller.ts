import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { readFile, unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { UpdateBikeSoldDto } from './dto/update-bike-sold.dto';
import { BikesService } from './bikes.service';
import { UploadCleanupInterceptor } from './upload-cleanup.interceptor';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImagesPerListing = 8;
const imageUploadOptions = {
  storage: diskStorage({
    destination: process.env.UPLOAD_DIR || 'uploads',
    filename: (_req, file, callback) => {
      callback(null, `${uuid()}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};

async function removeUploadedFiles(images: Express.Multer.File[] = []) {
  await Promise.all(images.map((image) => (image.path ? unlink(image.path).catch(() => undefined) : undefined)));
}

async function validateImageContent(image: Express.Multer.File) {
  const buffer = await readFile(image.path);

  const isJpeg = buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  const isWebp =
    buffer.length > 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';

  if (!isJpeg && !isPng && !isWebp) {
    await removeUploadedFiles([image]);
    throw new BadRequestException('Uploaded file content must be JPEG, PNG, or WebP');
  }
}

async function validateImageContents(images: Express.Multer.File[]) {
  try {
    await Promise.all(images.map((image) => validateImageContent(image)));
  } catch (error) {
    await removeUploadedFiles(images);
    throw error;
  }
}

function imageUrlsFromFiles(images: Express.Multer.File[], apiBaseUrl: string) {
  return images.map((image) => `${apiBaseUrl}/uploads/${image.filename}`);
}

function mergeOrderedImageUrls(updateBikeDto: UpdateBikeDto, uploadedImageUrls: string[]) {
  if (!updateBikeDto.imageOrder) {
    return uploadedImageUrls.length > 0 ? [...(updateBikeDto.imageUrls || []), ...uploadedImageUrls] : undefined;
  }

  return updateBikeDto.imageOrder
    .map((imageToken) => {
      if (imageToken.startsWith('existing:')) {
        return imageToken.replace(/^existing:/, '');
      }

      if (imageToken.startsWith('new:')) {
        const uploadIndex = Number(imageToken.replace(/^new:/, ''));
        return uploadedImageUrls[uploadIndex];
      }

      return undefined;
    })
    .filter(Boolean) as string[];
}

@Controller('bikes')
export class BikesController {
  constructor(
    private readonly bikesService: BikesService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  findAll() {
    return this.bikesService.findAll();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.bikesService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bikesService.findOne(id);
  }

  @Patch(':id/sold')
  @UseGuards(JwtAuthGuard)
  updateSold(@Param('id', ParseUUIDPipe) id: string, @Body() updateBikeSoldDto: UpdateBikeSoldDto) {
    return this.bikesService.updateSold(id, updateBikeSoldDto.sold);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', maxImagesPerListing, imageUploadOptions), UploadCleanupInterceptor)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBikeDto: UpdateBikeDto,
    @UploadedFiles() images: Express.Multer.File[] = [],
  ) {
    if (images.length > 0) {
      await validateImageContents(images);
    }

    const apiBaseUrl = this.configService.get<string>('API_PUBLIC_URL', 'http://localhost:3000');
    try {
      const uploadedImageUrls = imageUrlsFromFiles(images, apiBaseUrl);
      const orderedImageUrls = mergeOrderedImageUrls(updateBikeDto, uploadedImageUrls);
      return await this.bikesService.update(id, updateBikeDto, orderedImageUrls);
    } catch (error) {
      await removeUploadedFiles(images);
      throw error;
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', maxImagesPerListing, imageUploadOptions), UploadCleanupInterceptor)
  async create(@Body() createBikeDto: CreateBikeDto, @UploadedFiles() images: Express.Multer.File[] = []) {
    if (images.length === 0) {
      throw new BadRequestException('At least one bike image is required');
    }

    await validateImageContents(images);

    const apiBaseUrl = this.configService.get<string>('API_PUBLIC_URL', 'http://localhost:3000');
    try {
      return await this.bikesService.create(createBikeDto, imageUrlsFromFiles(images, apiBaseUrl));
    } catch (error) {
      await removeUploadedFiles(images);
      throw error;
    }
  }
}
