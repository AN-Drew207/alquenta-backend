import { User } from '../../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { PublicProfileResponseDto } from '../dto/public-profile-response.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { AdminSummaryResponseDto } from '../dto/admin-summary-response.dto';

export class UserResponseMapper {
  static toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      showPhoneOnListings: user.showPhoneOnListings,
    };
  }

  static toPublicDto(user: User): PublicProfileResponseDto {
    return {
      id: user.id,
      name: user.name,
      role: user.role,
    };
  }

  static toProfileDto(user: User): ProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      pendingEmail: user.pendingEmail,
      emailVerified: user.emailVerified,
      name: user.name,
      username: user.username,
      role: user.role,
      accountType: user.accountType,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      city: user.city,
      state: user.state,
      website: user.website,
      phone: user.phone,
      altPhone: user.altPhone,
      phoneVerified: user.phoneVerified,
      showPhoneOnListings: user.showPhoneOnListings,
      allowCalls: user.allowCalls,
      showEmail: user.showEmail,
      notificationPrefs: user.notificationPrefs,
      privacyPrefs: user.privacyPrefs,
      generalPrefs: user.generalPrefs,
      twoFactorEnabled: user.twoFactorEnabled,
      deactivatedAt: user.deactivatedAt,
      completeness: user.completeness,
    };
  }

  static toAdminSummaryDto(user: User): AdminSummaryResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
    };
  }
}
