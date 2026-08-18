import {
  Prisma,
  User as PrismaUser,
} from '../../../../../generated/prisma/client';
import { Role } from '../../../../shared/domain/role.enum';
import { AccountType } from '../../domain/enums/account-type.enum';
import { User } from '../../domain/entities/user.entity';
import type {
  GeneralPrefs,
  NotificationPrefs,
  PrivacyPrefs,
} from '../../domain/entities/user-preferences';

export class UserMapper {
  static toDomain(row: PrismaUser): User {
    return User.reconstitute({
      id: row.id,
      email: row.email,
      pendingEmail: row.pendingEmail,
      emailVerified: row.emailVerified,
      passwordHash: row.passwordHash,
      name: row.name,
      firstName: row.firstName,
      lastName: row.lastName,
      username: row.username,
      role: row.role as Role,
      accountType: row.accountType as AccountType,
      planId: row.planId,
      avatarUrl: row.avatarUrl,
      bio: row.bio,
      city: row.city,
      state: row.state,
      website: row.website,
      phone: row.phone,
      altPhone: row.altPhone,
      phoneVerified: row.phoneVerified,
      showWhatsapp: row.showWhatsapp,
      allowCalls: row.allowCalls,
      showEmail: row.showEmail,
      notificationPrefs:
        row.notificationPrefs as unknown as NotificationPrefs | null,
      privacyPrefs: row.privacyPrefs as unknown as PrivacyPrefs | null,
      generalPrefs: row.generalPrefs as unknown as GeneralPrefs | null,
      twoFactorEnabled: row.twoFactorEnabled,
      deactivatedAt: row.deactivatedAt,
      deactivatedBySuperadmin: row.deactivatedBySuperadmin,
      isVerified: row.isVerified,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      email: user.email,
      pendingEmail: user.pendingEmail,
      emailVerified: user.emailVerified,
      passwordHash: user.passwordHash,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role,
      accountType: user.accountType,
      planId: user.planId,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      city: user.city,
      state: user.state,
      website: user.website,
      phone: user.phone,
      altPhone: user.altPhone,
      phoneVerified: user.phoneVerified,
      showWhatsapp: user.showWhatsapp,
      allowCalls: user.allowCalls,
      showEmail: user.showEmail,
      notificationPrefs:
        user.notificationPrefs as unknown as Prisma.InputJsonValue,
      privacyPrefs: user.privacyPrefs as unknown as Prisma.InputJsonValue,
      generalPrefs: user.generalPrefs as unknown as Prisma.InputJsonValue,
      twoFactorEnabled: user.twoFactorEnabled,
      deactivatedAt: user.deactivatedAt,
      deactivatedBySuperadmin: user.deactivatedBySuperadmin,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
