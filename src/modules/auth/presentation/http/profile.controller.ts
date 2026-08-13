import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared/presentation/decorators/public.decorator';
import { CurrentUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../../shared/domain/authenticated-user.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/entity-not-found.exception';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile/update-profile.use-case';
import { UpdateProfileCommand } from '../../application/use-cases/update-profile/update-profile.command';
import { RequestEmailChangeUseCase } from '../../application/use-cases/request-email-change/request-email-change.use-case';
import { RequestEmailChangeCommand } from '../../application/use-cases/request-email-change/request-email-change.command';
import { ConfirmEmailChangeUseCase } from '../../application/use-cases/confirm-email-change/confirm-email-change.use-case';
import { isReservedUsername, PatchProfileRequestDto } from './dto/patch-profile-request.dto';
import { RequestEmailChangeRequestDto } from './dto/request-email-change-request.dto';
import { UsernameAvailabilityResponseDto } from './dto/username-availability-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UserResponseMapper } from './mappers/user-response.mapper';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly requestEmailChangeUseCase: RequestEmailChangeUseCase,
    private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCase,
  ) {}

  @ApiOperation({ summary: "Get the authenticated user's full profile" })
  @Get()
  async getProfile(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findById(authenticatedUser.id);
    if (!user) {
      throw new EntityNotFoundException('User', authenticatedUser.id);
    }
    return UserResponseMapper.toProfileDto(user);
  }

  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @Patch()
  async patchProfile(
    @Body() dto: PatchProfileRequestDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ProfileResponseDto> {
    const user = await this.updateProfileUseCase.execute(
      new UpdateProfileCommand(authenticatedUser.id, {
        name: dto.name,
        username:
          dto.username !== undefined
            ? (dto.username?.toLowerCase() ?? null)
            : undefined,
        accountType: dto.accountType,
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
        city: dto.city,
        state: dto.state,
        website: dto.website,
        phone: dto.phone,
        altPhone: dto.altPhone,
        showPhoneOnListings: dto.showPhoneOnListings,
        allowCalls: dto.allowCalls,
        showEmail: dto.showEmail,
        notificationPrefs: dto.notificationPrefs,
        privacyPrefs: dto.privacyPrefs,
        generalPrefs: dto.generalPrefs,
      }),
    );
    return UserResponseMapper.toProfileDto(user);
  }

  @ApiOperation({ summary: 'Check whether a username is available' })
  @Get('username-availability')
  async checkUsernameAvailability(
    @Query('value') value: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<UsernameAvailabilityResponseDto> {
    const username = (value ?? '').toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(username) || isReservedUsername(username)) {
      return { available: false };
    }
    const existing = await this.userRepository.findByUsername(username);
    return { available: !existing || existing.id === authenticatedUser.id };
  }

  @ApiOperation({
    summary: 'Request an email change — sends a confirmation link to the new address',
  })
  @Post('email')
  async requestEmailChange(
    @Body() dto: RequestEmailChangeRequestDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<{ ok: true }> {
    await this.requestEmailChangeUseCase.execute(
      new RequestEmailChangeCommand(authenticatedUser.id, dto.newEmail),
    );
    return { ok: true };
  }

  @ApiOperation({ summary: 'Confirm a pending email change from the emailed link' })
  @Public()
  @Get('email/confirm')
  async confirmEmailChange(@Query('token') token: string): Promise<ProfileResponseDto> {
    const user = await this.confirmEmailChangeUseCase.execute(token);
    return UserResponseMapper.toProfileDto(user);
  }
}
