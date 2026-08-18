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
      showWhatsapp: user.showWhatsapp,
    };
  }

  static toPublicDto(user: User): PublicProfileResponseDto {
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      website: user.website,
      memberSince: user.createdAt,
      isVerified: user.isVerified,
      // Contact details are only public when the user opted in — same
      // toggles that already gate them elsewhere (profile settings).
      phone: user.showWhatsapp ? user.phone : null,
      email: user.showEmail ? user.email : null,
    };
  }

  static toProfileDto(user: User): ProfileResponseDto {
    return {
      id: user.id,
      email: user.email,
      pendingEmail: user.pendingEmail,
      emailVerified: user.emailVerified,
      displayName: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      accountType: user.accountType,
      plan: null,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      city: user.city,
      state: user.state,
      website: user.website,
      phone: user.phone,
      altPhone: user.altPhone,
      showWhatsapp: user.showWhatsapp,
      allowCalls: user.allowCalls,
      showEmail: user.showEmail,
      generalPrefs: user.generalPrefs,
      deactivatedAt: user.deactivatedAt,
      createdAt: user.createdAt,
      completion: user.completion,
    };
  }

  static toAdminSummaryDto(user: User): AdminSummaryResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      planId: user.planId,
      createdAt: user.createdAt,
      deactivatedAt: user.deactivatedAt,
      isVerified: user.isVerified,
    };
  }
}
