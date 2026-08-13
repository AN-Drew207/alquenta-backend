import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../../shared/domain/role.enum';

export class PublicProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: Role })
  role: Role;
}
