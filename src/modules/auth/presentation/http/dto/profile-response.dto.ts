import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../../../shared/domain/role.enum';
import { AccountType } from '../../../domain/enums/account-type.enum';
import type { GeneralPrefs } from '../../../domain/entities/user-preferences';
import { PlanResponseDto } from '../../../../plans/presentation/http/dto/plan-response.dto';

export class ProfileCompletionDto {
  @ApiProperty()
  pct: number;

  @ApiProperty({ type: [String] })
  missing: string[];
}

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  pendingEmail: string | null;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({
    description:
      'Alias for the underlying `name` column, shown throughout the header, conversations, and property listings.',
  })
  displayName: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false, nullable: true })
  username: string | null;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;

  @ApiProperty({
    type: PlanResponseDto,
    required: false,
    nullable: true,
    description:
      'The subscription plan assigned to this account (ADMIN only, otherwise null)',
  })
  plan: PlanResponseDto | null;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ required: false, nullable: true })
  bio: string | null;

  @ApiProperty({ required: false, nullable: true })
  city: string | null;

  @ApiProperty({ required: false, nullable: true })
  state: string | null;

  @ApiProperty({ required: false, nullable: true })
  website: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone: string | null;

  @ApiProperty({ required: false, nullable: true })
  altPhone: string | null;

  @ApiProperty()
  showWhatsapp: boolean;

  @ApiProperty()
  allowCalls: boolean;

  @ApiProperty()
  showEmail: boolean;

  @ApiProperty()
  generalPrefs: GeneralPrefs;

  @ApiProperty({ required: false, nullable: true })
  deactivatedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ProfileCompletionDto })
  completion: ProfileCompletionDto;
}
