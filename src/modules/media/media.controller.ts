import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/presentation/decorators/current-user.decorator';
import { Role } from '../../shared/domain/role.enum';
import type { AuthenticatedUser } from '../../shared/domain/authenticated-user.interface';
import { MediaService } from './media.service';
import { MediaSignatureRequestDto } from './dto/media-signature-request.dto';
import { MediaSignatureResponseDto } from './dto/media-signature-response.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({
    summary:
      'Get a signed Cloudinary upload signature — the file is uploaded directly from the browser to Cloudinary, never through this API. Property uploads require ADMIN; avatar uploads are open to any authenticated user.',
  })
  @Post('signature')
  createSignature(
    @Body() dto: MediaSignatureRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): MediaSignatureResponseDto {
    const target = dto.target ?? 'property';
    if (target === 'property' && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can upload property media');
    }

    return this.mediaService.createUploadSignature(dto.resourceType, target);
  }
}
