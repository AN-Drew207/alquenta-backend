import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../../shared/domain/role.enum';

export class PublicProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ required: false, nullable: true })
  bio: string | null;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ required: false, nullable: true })
  website: string | null;

  @ApiProperty()
  memberSince: Date;

  @ApiProperty({
    description: 'Manually set by a SUPERADMIN — no automatic criteria.',
  })
  isVerified: boolean;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Only present when the user opted to show it publicly.',
  })
  phone: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Only present when the user opted to show it publicly.',
  })
  email: string | null;
}
