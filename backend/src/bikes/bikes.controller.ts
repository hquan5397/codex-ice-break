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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { readFile, unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateBikeCommand,
  CreateBikeDto,
  UpdateBikeCommand,
  UpdateBikeDto,
  UpdateBikeSoldCommand,
  UpdateBikeSoldDto,
} from './commands';
import { GetAdminBikesQuery, GetBikeQuery, GetPublicBikesQuery } from './queries';
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
    const mergedImageUrls = uploadedImageUrls.length > 0 ? [...(updateBikeDto.imageUrls || []), ...uploadedImageUrls] : undefined;

    if (mergedImageUrls && mergedImageUrls.length > maxImagesPerListing) {
      throw new BadRequestException(`A listing can contain up to ${maxImagesPerListing} images`);
    }

    return mergedImageUrls;
  }

  const orderedImageUrls = updateBikeDto.imageOrder.map((imageToken) => {
    if (imageToken.startsWith('existing:')) {
      const existingImageUrl = imageToken.replace(/^existing:/, '');

      if (!updateBikeDto.imageUrls?.includes(existingImageUrl)) {
        throw new BadRequestException('Image order includes an unknown existing image');
      }

      return existingImageUrl;
    }

    if (imageToken.startsWith('new:')) {
      const uploadIndex = Number(imageToken.replace(/^new:/, ''));
      const uploadedImageUrl = uploadedImageUrls[uploadIndex];

      if (!Number.isInteger(uploadIndex) || !uploadedImageUrl) {
        throw new BadRequestException('Image order includes an unknown uploaded image');
      }

      return uploadedImageUrl;
    }

    throw new BadRequestException('Image order contains an invalid token');
  });

  if (orderedImageUrls.length === 0 || orderedImageUrls.length > maxImagesPerListing) {
    throw new BadRequestException(`A listing must contain between 1 and ${maxImagesPerListing} images`);
  }

  return orderedImageUrls;
}

@Controller('bikes')
export class BikesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll() {
    return this.queryBus.execute(new GetPublicBikesQuery());
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.queryBus.execute(new GetAdminBikesQuery());
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetBikeQuery(id));
  }

  @Patch(':id/sold')
  @UseGuards(JwtAuthGuard)
  updateSold(@Param('id', ParseUUIDPipe) id: string, @Body() updateBikeSoldDto: UpdateBikeSoldDto) {
    return this.commandBus.execute(new UpdateBikeSoldCommand(id, updateBikeSoldDto.sold));
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
      return await this.commandBus.execute(new UpdateBikeCommand(id, updateBikeDto, orderedImageUrls));
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
      return await this.commandBus.execute(new CreateBikeCommand(createBikeDto, imageUrlsFromFiles(images, apiBaseUrl)));
    } catch (error) {
      await removeUploadedFiles(images);
      throw error;
    }
  }
}
