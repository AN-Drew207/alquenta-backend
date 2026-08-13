import { ApiProperty } from '@nestjs/swagger';

export class UsernameAvailabilityResponseDto {
  @ApiProperty()
  available: boolean;
}
