import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProfileRequestDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showWhatsapp?: boolean;
}
