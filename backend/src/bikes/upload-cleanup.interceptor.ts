import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class UploadCleanupInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<{
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
    }>();

    return next.handle().pipe(
      catchError((error: unknown) => {
        this.getUploadedFiles(request).forEach((file) => {
          if (file.path) {
            void unlink(file.path).catch(() => undefined);
          }
        });

        return throwError(() => error);
      }),
    );
  }

  private getUploadedFiles(request: {
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
  }) {
    if (request.file) {
      return [request.file];
    }

    if (Array.isArray(request.files)) {
      return request.files;
    }

    if (request.files) {
      return Object.values(request.files).flat();
    }

    return [];
  }
}
