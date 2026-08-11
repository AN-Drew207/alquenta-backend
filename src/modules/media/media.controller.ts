import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/presentation/decorators/roles.decorator';
import { Role } from '../../shared/domain/role.enum';
import { MediaService } from './media.service';
import { MediaSignatureRequestDto } from './dto/media-signature-request.dto';
import { MediaSignatureResponseDto } from './dto/media-signature-response.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({
    summary:
      'Get a signed Cloudinary upload signature (ADMIN only) — the file is uploaded directly from the browser to Cloudinary, never through this API',
  })
  @Roles(Role.ADMIN)
  @Post('signature')
  createSignature(
    @Body() dto: MediaSignatureRequestDto,
  ): MediaSignatureResponseDto {
    return this.mediaService.createUploadSignature(dto.resourceType);
  }
}
