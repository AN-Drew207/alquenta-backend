import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { MediaSignatureResponseDto } from './dto/media-signature-response.dto';

const MAX_FILE_SIZE_BYTES: Record<'image' | 'video', number> = {
  image: 5 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};

const UPLOAD_FOLDER = 'alquenta/properties';

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService) {}

  createUploadSignature(resourceType: 'image' | 'video'): MediaSignatureResponseDto {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Media uploads are not configured yet (missing CLOUDINARY_* environment variables).',
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const maxFileSize = MAX_FILE_SIZE_BYTES[resourceType];
    // Cloudinary excludes max_file_size from the signed string even though it's
    // accepted on the upload request — verified against its own signature error.
    const paramsToSign = {
      timestamp,
      folder: UPLOAD_FOLDER,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return {
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder: UPLOAD_FOLDER,
      maxFileSize,
      resourceType,
    };
  }
}
