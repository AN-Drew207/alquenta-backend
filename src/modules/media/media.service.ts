import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { MediaSignatureResponseDto } from './dto/media-signature-response.dto';
import { MediaUploadsNotConfiguredException } from './exceptions/media-uploads-not-configured.exception';

// Property uploads are never transformed, so the URL always looks like
// .../upload/v<version>/<public_id>.<ext> — no transformation segment to skip.
const PUBLIC_ID_PATTERN = /\/upload\/v\d+\/(.+)\.[a-zA-Z0-9]+$/;

const MAX_FILE_SIZE_BYTES: Record<'image' | 'video', number> = {
  image: 5 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly configService: ConfigService) {}

  private uploadFolders(): Record<'property' | 'avatar', string> {
    const prefix =
      this.configService.get<string>('CLOUDINARY_FOLDER_PREFIX') ?? 'alquenta';
    return {
      property: `${prefix}/properties`,
      avatar: `${prefix}/avatars`,
    };
  }

  createUploadSignature(
    resourceType: 'image' | 'video',
    target: 'property' | 'avatar' = 'property',
  ): MediaSignatureResponseDto {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new MediaUploadsNotConfiguredException();
    }

    const timestamp = Math.round(Date.now() / 1000);
    const maxFileSize = MAX_FILE_SIZE_BYTES[resourceType];
    const folder = this.uploadFolders()[target];
    // Cloudinary excludes max_file_size (and transformation, for signing
    // purposes here) from the signed string even though it's accepted on the
    // upload request — verified against its own signature error.
    const paramsToSign: Record<string, string | number> = { timestamp, folder };
    if (target === 'avatar') {
      paramsToSign.transformation = 'c_fill,g_face,w_800,h_800';
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret,
    );

    return {
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
      maxFileSize,
      resourceType,
      transformation:
        target === 'avatar' ? 'c_fill,g_face,w_800,h_800' : undefined,
    };
  }

  /**
   * Best-effort Cloudinary cleanup — logs and swallows failures so a
   * Cloudinary outage never blocks deleting the underlying record.
   */
  async deleteAssets(
    urls: string[],
    resourceType: 'image' | 'video',
  ): Promise<void> {
    if (urls.length === 0) return;

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) return;

    const publicIds = urls
      .map((url) => url.match(PUBLIC_ID_PATTERN)?.[1])
      .filter((id): id is string => !!id);
    if (publicIds.length === 0) return;

    try {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete ${publicIds.length} Cloudinary ${resourceType}(s): ${(error as Error).message}`,
      );
    }
  }
}
