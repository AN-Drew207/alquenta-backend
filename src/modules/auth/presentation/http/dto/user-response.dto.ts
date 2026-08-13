import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../../shared/domain/role.enum';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty()
  showPhoneOnListings: boolean;
}
