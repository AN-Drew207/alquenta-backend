import { Prisma, User as PrismaUser } from '../../../../../generated/prisma/client';
import { Role } from '../../../../shared/domain/role.enum';
import { User } from '../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(row: PrismaUser): User {
    return User.reconstitute({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name,
      role: row.role as Role,
      phone: row.phone,
      showPhoneOnListings: row.showPhoneOnListings,
    });
  }

  static toPersistence(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role,
      phone: user.phone,
      showPhoneOnListings: user.showPhoneOnListings,
    };
  }
}
